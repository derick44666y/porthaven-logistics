import sys
import json
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def format_cents(cents, currency):
    negative = cents < 0
    abs_cents = abs(cents)
    major = abs_cents // 100
    minor = str(abs_cents % 100).zfill(2)
    return f"{'-' if negative else ''}{major:,}.{minor} {currency}"

def generate_pdf(data, output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#152641') # PortHaven Navy
    )
    
    company_style = ParagraphStyle(
        'CompanyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=colors.HexColor('#475569')
    )

    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#152641'),
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=colors.HexColor('#334155')
    )

    body_bold = ParagraphStyle(
        'BodyTextBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=14,
        textColor=colors.HexColor('#0f172a')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )

    story = []

    # 1. Header (Company details left, "INVOICE" right)
    company = data['company']
    company_text = f"<b>{company['name']}</b><br/>{company['address']}<br/>Email: {company['email']}<br/>Phone: {company['phone']}<br/>Tax ID: {company['taxId']}<br/>{company['website']}"
    
    header_data = [
        [Paragraph(company_text, company_style), Paragraph("INVOICE", title_style)]
    ]
    
    header_table = Table(header_data, colWidths=[300, 195])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 20))

    # 2. Invoice Meta Box
    meta_text = f"<b>Invoice Number:</b> {data['invoiceNumber']}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Issue Date:</b> {data['issueDate']}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Due Date:</b> {data['dueDate']}"
    meta_table = Table([[Paragraph(meta_text, body_style)]], colWidths=[495])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))

    # 3. Bill To vs Shipment Info
    bill_to = data['billTo']
    shipment = data['shipment']
    
    bill_to_text = f"<font color='#152641'><b>BILL TO</b></font><br/><b>{bill_to['name']}</b><br/>{bill_to['email']}<br/>{bill_to['address'].replace('\n', '<br/>')}"
    
    shipment_text = f"<font color='#152641'><b>SHIPMENT SUMMARY</b></font><br/>" \
                    f"<b>Tracking:</b> {shipment['trackingNumber']}<br/>" \
                    f"<b>Service:</b> {shipment['mode']}<br/>" \
                    f"<b>Route:</b> {shipment['origin']} &rarr; {shipment['destination']}<br/>" \
                    f"<b>Receiver:</b> {shipment['receiverName']}<br/>" \
                    f"<b>Est. Delivery:</b> {shipment['estimatedDelivery']}<br/>" \
                    f"<b>Status:</b> {shipment['status'].replace('_', ' ').title()}"

    details_data = [
        [Paragraph(bill_to_text, body_style), Paragraph(shipment_text, body_style)]
    ]
    
    details_table = Table(details_data, colWidths=[240, 255])
    details_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(details_table)
    story.append(Spacer(1, 25))

    # 4. Line Items Table
    table_data = [
        [Paragraph("DESCRIPTION", table_header_style), Paragraph("AMOUNT", table_header_style)]
    ]
    
    for item in data['lineItems']:
        desc_text = f"<b>{item['description']}</b><br/><font color='#64748b'>{item['detail']}</font>"
        amount_text = format_cents(item['amountCents'], data['currency'])
        table_data.append([
            Paragraph(desc_text, body_style),
            Paragraph(amount_text, body_style)
        ])
        
    # Totals rows
    subtotal_val = format_cents(data['subtotalCents'], data['currency'])
    tax_val = f"{data['taxRatePercent']}% ({format_cents(data['taxCents'], data['currency'])})"
    total_val = format_cents(data['totalCents'], data['currency'])
    
    table_data.append([Paragraph("Subtotal", body_bold), Paragraph(subtotal_val, body_style)])
    table_data.append([Paragraph(f"Tax ({data['taxRatePercent']}%)", body_bold), Paragraph(tax_val, body_style)])
    table_data.append([Paragraph("Total Due", body_bold), Paragraph(total_val, body_bold)])

    items_table = Table(table_data, colWidths=[380, 115])
    
    t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#152641')), # PortHaven Navy
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]
    
    items_table.setStyle(TableStyle(t_style))
    story.append(items_table)
    
    doc.build(story)

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.stdin.read())
        output_file = sys.argv[1] if len(sys.argv) > 1 else "invoice.pdf"
        generate_pdf(input_data, output_file)
        sys.exit(0)
    except Exception as e:
        print(f"Python error: {e}", file=sys.stderr)
        sys.exit(1)
