import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'
import { buildInvoice } from '../utils/invoice.js'
import { spawn } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'

const router = Router()
const prisma = new PrismaClient()

// GET /invoice/:id — admin only — returns a PDF invoice for the shipment
router.get('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  let tempPdfPath = ''
  try {
    const { id } = req.params

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: { customer: true },
    })
    if (!shipment) {
      res.status(404).json({ error: 'Shipment not found' })
      return
    }

    const inv = buildInvoice(shipment, shipment.customer)
    const filename = `invoice-${inv.invoiceNumber}.pdf`

    // Setup temporary PDF file path
    tempPdfPath = path.join(os.tmpdir(), `invoice-${crypto.randomBytes(8).toString('hex')}.pdf`)

    // Resolve Python interpreter path cross-platform
    // Try multiple possible locations for the virtual environment
    const possibleVenvPaths = [
      path.join(process.cwd(), '.venv', 'Scripts', 'python.exe'),
      path.join(process.cwd(), '.venv', 'bin', 'python'),
      path.join(process.cwd(), 'server', '.venv', 'Scripts', 'python.exe'),
      path.join(process.cwd(), 'server', '.venv', 'bin', 'python'),
    ]
    let pythonPath = 'python3' // Default fallback
    for (const venvPath of possibleVenvPaths) {
      if (fs.existsSync(venvPath)) {
        pythonPath = venvPath
        break
      }
    }

    // Resolve Python script path - try multiple possible locations
    const possibleScriptPaths = [
      path.join(process.cwd(), 'server', 'src', 'invoice_generator.py'),
      path.join(process.cwd(), 'src', 'invoice_generator.py'),
      path.join(__dirname, '..', 'invoice_generator.py'),
    ]
    let scriptPath = possibleScriptPaths[0]
    for (const script of possibleScriptPaths) {
      if (fs.existsSync(script)) {
        scriptPath = script
        break
      }
    }

    // Check if script exists before spawning
    if (!fs.existsSync(scriptPath)) {
      console.error(`Invoice script not found at: ${scriptPath}`)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Invoice generation not available - Python script missing' })
      }
      return
    }

    // Spawn Python script to generate invoice PDF
    const py = spawn(pythonPath, [scriptPath, tempPdfPath])
    py.stdin.write(JSON.stringify(inv))
    py.stdin.end()

    let stderr = ''
    py.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    py.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script failed with exit code ${code}. Stderr: ${stderr}`)
        if (!res.headersSent) {
          res.status(500).json({ error: `Failed to generate PDF: ${stderr || 'Python script error'}` })
        }
        return
      }

      // Send generated PDF file
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
      
      const fileStream = fs.createReadStream(tempPdfPath)
      fileStream.pipe(res)

      fileStream.on('close', () => {
        // Clean up temp file
        fs.unlink(tempPdfPath, (err) => {
          if (err) console.error('Error deleting temp PDF:', err)
        })
      })
    })

  } catch (err) {
    console.error('Invoice generation error:', err)
    if (tempPdfPath && fs.existsSync(tempPdfPath)) {
      fs.unlink(tempPdfPath, () => {})
    }
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' })
  }
})

export default router