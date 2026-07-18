import sys
import json
import os
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.platypus import Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm

NAVY    = colors.HexColor('#0f2a4a')
ACCENT  = colors.HexColor('#1e6fb5')
LIGHT   = colors.HexColor('#e8f1fb')
MUTED   = colors.HexColor('#64748b')
BORDER  = colors.HexColor('#cbd5e1')
WHITE   = colors.white
BLACK   = colors.HexColor('#0f172a')

W, H = A4
MARGIN = 18 * mm
INNER  = W - 2 * MARGIN

def fmt(cents, currency):
    neg = cents < 0
    a = abs(cents)
    return f"{'-' if neg else ''}{a // 100:,}.{str(a % 100).zfill(2)} {currency}"

def style(name, **kw):
    base = getSampleStyleSheet()['Normal']
    return ParagraphStyle(name, parent=base, **kw)

def generate_pdf(data, output_path, logo_path=''):
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN
    )

    s_title   = style('T',  fontName='Helvetica-Bold', fontSize=28, textColor=WHITE)
    s_sub     = style('S',  fontName='Helvetica',      fontSize=8,  textColor=colors.HexColor('#93c5fd'), leading=13)
    s_co      = style('CO', fontName='Helvetica',      fontSize=8,  textColor=WHITE, leading=13)
    s_label   = style('L',  fontName='Helvetica-Bold', fontSize=7,  textColor=MUTED, leading=10)
    s_val     = style('V',  fontName='Helvetica',      fontSize=9,  textColor=BLACK, leading=13)
    s_val_b   = style('VB', fontName='Helvetica-Bold', fontSize=9,  textColor=BLACK, leading=13)
    s_sec     = style('SC', fontName='Helvetica-Bold', fontSize=7,  textColor=ACCENT, leading=10)
    s_th      = style('TH', fontName='Helvetica-Bold', fontSize=8,  textColor=WHITE, leading=11)
    s_td      = style('TD', fontName='Helvetica',      fontSize=8,  textColor=BLACK, leading=12)
    s_td_m    = style('TM', fontName='Helvetica',      fontSize=8,  textColor=MUTED, leading=11)
    s_td_b    = style('TB', fontName='Helvetica-Bold', fontSize=9,  textColor=BLACK, leading=13)
    s_total   = style('TT', fontName='Helvetica-Bold', fontSize=10, textColor=WHITE, leading=14)
    s_foot    = style('F',  fontName='Helvetica',      fontSize=7,  textColor=MUTED, leading=11, alignment=1)

    story = []
    company  = data['company']
    bill_to  = data['billTo']
    shipment = data['shipment']
    currency = data['currency']

    # ── HEADER BANNER ────────────────────────────────────────────────────────
    logo_cell = ''
    if logo_path and os.path.exists(logo_path):
        try:
            img = RLImage(logo_path, width=12*mm, height=12*mm)
            img.hAlign = 'LEFT'
            logo_cell = img
        except Exception:
            logo_cell = Paragraph(f"<b>{company['name']}</b>", s_co)
    else:
        logo_cell = Paragraph(f"<b>{company['name']}</b>", s_co)

    co_lines = (
        f"{company['name']}<br/>"
        f"{company['address']}<br/>"
        f"{company['email']}  ·  {company['phone']}<br/>"
        f"Tax ID: {company['taxId']}"
    )

    right_block = [
        Paragraph("INVOICE", s_title),
        Paragraph(f"# {data['invoiceNumber']}", s_sub),
    ]

    banner_data = [[
        [logo_cell, Paragraph(co_lines, s_co)],
        right_block
    ]]
    banner_inner = Table(
        [[logo_cell, Paragraph(co_lines, s_co)]],
        colWidths=[14*mm, INNER * 0.55 - 14*mm]
    )
    banner_inner.setStyle(TableStyle([
        ('VALIGN',       (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING',  (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING',   (0,0), (-1,-1), 0),
        ('BOTTOMPADDING',(0,0), (-1,-1), 0),
    ]))

    right_para = Table(
        [[Paragraph("INVOICE", s_title)], [Paragraph(f"# {data['invoiceNumber']}", s_sub)]],
        colWidths=[INNER * 0.45]
    )
    right_para.setStyle(TableStyle([
        ('ALIGN',        (0,0), (-1,-1), 'RIGHT'),
        ('LEFTPADDING',  (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING',   (0,0), (-1,-1), 0),
        ('BOTTOMPADDING',(0,0), (-1,-1), 2),
    ]))

    header_tbl = Table(
        [[banner_inner, right_para]],
        colWidths=[INNER * 0.55, INNER * 0.45]
    )
    header_tbl.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,-1), NAVY),
        ('VALIGN',       (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING',  (0,0), (-1,-1), 5*mm),
        ('RIGHTPADDING', (0,0), (-1,-1), 5*mm),
        ('TOPPADDING',   (0,0), (-1,-1), 5*mm),
        ('BOTTOMPADDING',(0,0), (-1,-1), 5*mm),
        ('ROUNDEDCORNERS', [3]),
    ]))
    story.append(header_tbl)
    story.append(Spacer(1, 5*mm))

    # ── META ROW (dates) ─────────────────────────────────────────────────────
    def meta_cell(label, value):
        return [Paragraph(label.upper(), s_label), Paragraph(value, s_val_b)]

    meta_tbl = Table(
        [[ Table([meta_cell("Issue Date",    data['issueDate'])],    colWidths=[INNER/3]),
           Table([meta_cell("Due Date",      data['dueDate'])],      colWidths=[INNER/3]),
           Table([meta_cell("Currency",      currency)],             colWidths=[INNER/3]) ]],
        colWidths=[INNER/3, INNER/3, INNER/3]
    )
    meta_tbl.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,-1), LIGHT),
        ('LEFTPADDING',  (0,0), (-1,-1), 4*mm),
        ('RIGHTPADDING', (0,0), (-1,-1), 4*mm),
        ('TOPPADDING',   (0,0), (-1,-1), 3*mm),
        ('BOTTOMPADDING',(0,0), (-1,-1), 3*mm),
        ('VALIGN',       (0,0), (-1,-1), 'TOP'),
        ('LINEAFTER',    (0,0), (1,0),   0.5, BORDER),
        ('ROUNDEDCORNERS', [3]),
    ]))
    story.append(meta_tbl)
    story.append(Spacer(1, 5*mm))

    # ── BILL TO / SHIPMENT SUMMARY ───────────────────────────────────────────
    bill_addr = bill_to['address'].replace('\n', '<br/>')
    bill_lines = (
        f"<font color='#1e6fb5'><b>BILL TO</b></font><br/>"
        f"<b>{bill_to['name']}</b><br/>"
        f"{bill_to['email']}<br/>"
        f"{bill_addr}"
    )
    status_display = shipment['status'].replace('_', ' ').title()
    ship_lines = (
        f"<font color='#1e6fb5'><b>SHIPMENT DETAILS</b></font><br/>"
        f"<b>Tracking:</b> {shipment['trackingNumber']}<br/>"
        f"<b>Service:</b> {shipment['mode']}<br/>"
        f"<b>Route:</b> {shipment['origin']} \u2192 {shipment['destination']}<br/>"
        f"<b>Receiver:</b> {shipment['receiverName']}<br/>"
        f"<b>Est. Delivery:</b> {shipment['estimatedDelivery']}<br/>"
        f"<b>Status:</b> {status_display}"
    )

    addr_tbl = Table(
        [[Paragraph(bill_lines, s_val), Paragraph(ship_lines, s_val)]],
        colWidths=[INNER * 0.48, INNER * 0.52]
    )
    addr_tbl.setStyle(TableStyle([
        ('VALIGN',       (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING',  (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING',   (0,0), (-1,-1), 0),
        ('BOTTOMPADDING',(0,0), (-1,-1), 0),
        ('LINEAFTER',    (0,0), (0,0),   0.5, BORDER),
        ('RIGHTPADDING', (0,0), (0,0),   4*mm),
        ('LEFTPADDING',  (1,0), (1,0),   4*mm),
    ]))
    story.append(addr_tbl)
    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width=INNER, thickness=0.5, color=BORDER))
    story.append(Spacer(1, 4*mm))

    # ── LINE ITEMS TABLE ─────────────────────────────────────────────────────
    col_desc = INNER * 0.72
    col_amt  = INNER * 0.28

    rows = [[Paragraph("DESCRIPTION", s_th), Paragraph("AMOUNT", s_th)]]
    for i, item in enumerate(data['lineItems']):
        desc = f"<b>{item['description']}</b><br/><font color='#64748b'>{item['detail']}</font>"
        rows.append([Paragraph(desc, s_td), Paragraph(fmt(item['amountCents'], currency), s_td)])

    # spacer row before totals
    rows.append(['', ''])

    subtotal = fmt(data['subtotalCents'], currency)
    tax_pct  = data['taxRatePercent']
    tax_val  = fmt(data['taxCents'], currency)
    total    = fmt(data['totalCents'], currency)

    rows.append([Paragraph("Subtotal", s_td),   Paragraph(subtotal, s_td)])
    rows.append([Paragraph(f"Tax ({tax_pct}%)", s_td), Paragraph(tax_val, s_td)])
    rows.append([Paragraph("TOTAL DUE", s_total), Paragraph(total, s_total)])

    n = len(rows)
    spacer_row = n - 4   # index of blank spacer row
    total_row  = n - 1

    items_tbl = Table(rows, colWidths=[col_desc, col_amt])
    items_tbl.setStyle(TableStyle([
        # header
        ('BACKGROUND',    (0,0),  (-1,0),           NAVY),
        ('TOPPADDING',    (0,0),  (-1,0),            3*mm),
        ('BOTTOMPADDING', (0,0),  (-1,0),            3*mm),
        # data rows alternating
        ('BACKGROUND',    (0,1),  (-1, spacer_row-1), WHITE),
        ('ROWBACKGROUNDS',(0,1),  (-1, spacer_row-1), [WHITE, LIGHT]),
        # subtotal / tax rows
        ('BACKGROUND',    (0, spacer_row+1), (-1, total_row-1), colors.HexColor('#f1f5f9')),
        ('TOPPADDING',    (0, spacer_row+1), (-1, total_row-1), 2*mm),
        ('BOTTOMPADDING', (0, spacer_row+1), (-1, total_row-1), 2*mm),
        # total row
        ('BACKGROUND',    (0, total_row), (-1, total_row), ACCENT),
        ('TOPPADDING',    (0, total_row), (-1, total_row), 3*mm),
        ('BOTTOMPADDING', (0, total_row), (-1, total_row), 3*mm),
        # spacer row
        ('TOPPADDING',    (0, spacer_row), (-1, spacer_row), 1),
        ('BOTTOMPADDING', (0, spacer_row), (-1, spacer_row), 1),
        # alignment
        ('ALIGN',         (1,0),  (-1,-1),           'RIGHT'),
        ('VALIGN',        (0,0),  (-1,-1),           'MIDDLE'),
        # padding
        ('LEFTPADDING',   (0,0),  (-1,-1),           4*mm),
        ('RIGHTPADDING',  (0,0),  (-1,-1),           4*mm),
        ('TOPPADDING',    (0,1),  (-1, spacer_row-1), 2.5*mm),
        ('BOTTOMPADDING', (0,1),  (-1, spacer_row-1), 2.5*mm),
        # grid
        ('LINEBELOW',     (0,0),  (-1, spacer_row-1), 0.3, BORDER),
        ('ROUNDEDCORNERS', [3]),
    ]))
    story.append(items_tbl)
    story.append(Spacer(1, 8*mm))

    # ── FOOTER ───────────────────────────────────────────────────────────────
    story.append(HRFlowable(width=INNER, thickness=0.5, color=BORDER))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        f"Thank you for choosing {company['name']}  ·  {company['website']}  ·  {company['email']}",
        s_foot
    ))

    doc.build(story)


if __name__ == "__main__":
    try:
        input_data = json.loads(sys.stdin.read())
        output_file = sys.argv[1] if len(sys.argv) > 1 else "invoice.pdf"
        logo        = sys.argv[2] if len(sys.argv) > 2 else ""
        generate_pdf(input_data, output_file, logo)
        sys.exit(0)
    except Exception as e:
        print(f"Python error: {e}", file=sys.stderr)
        sys.exit(1)
