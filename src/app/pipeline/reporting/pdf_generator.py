import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


def generate_flood_assessment_pdf(village_data: dict, officer_info: dict) -> io.BytesIO:
    """
    Generates an official Government of West Bengal PDF Crop Inundation & Disaster Relief Report.
    Returns an in-memory BytesIO buffer.
    """
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    story = []
    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY_NAVY = colors.HexColor("#0f172a")
    ACCENT_RED = colors.HexColor("#dc2626")
    BG_LIGHT = colors.HexColor("#f8fafc")
    BORDER_COLOR = colors.HexColor("#cbd5e1")

    # Typography Styles
    title_style = ParagraphStyle(
        "GovTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=18,
        textColor=PRIMARY_NAVY,
        alignment=TA_CENTER,
        spaceAfter=3,
    )

    subtitle_style = ParagraphStyle(
        "GovSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#475569"),
        alignment=TA_CENTER,
        spaceAfter=4,
    )

    tag_style = ParagraphStyle(
        "GovTag",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=ACCENT_RED,
        alignment=TA_CENTER,
        spaceAfter=10,
    )

    section_header_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=PRIMARY_NAVY,
        spaceBefore=8,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#334155"),
    )

    body_bold = ParagraphStyle(
        "BodyBoldCustom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=PRIMARY_NAVY,
    )

    # 1. Header Banner
    story.append(Paragraph("GOVERNMENT OF WEST BENGAL", title_style))
    story.append(
        Paragraph(
            "DEPARTMENT OF AGRICULTURE & DISASTER MANAGEMENT RELIEF DIVISION",
            subtitle_style,
        )
    )
    story.append(
        Paragraph(
            "HOOGHLY & DAMODAR RIVER BASIN COMMAND SYSTEM • CROP DAMAGE ASSESSMENT REPORT",
            tag_style,
        )
    )
    story.append(
        HRFlowable(
            width="100%",
            thickness=2,
            color=PRIMARY_NAVY,
            spaceBefore=0,
            spaceAfter=10,
        )
    )

    # 2. Metadata Grid
    report_id = f"WB-AGRI-2026-{(village_data.get('id', 'V101')).upper()}-881"
    timestamp_str = datetime.now(timezone.utc).strftime("%d %b %Y, %H:%M UTC")
    officer_name = officer_info.get("name", "Officer In-Charge (BDO)")

    meta_data = [
        [
            Paragraph("<b>REPORT REFERENCE ID:</b>", body_style),
            Paragraph(f"<b>{report_id}</b>", body_bold),
            Paragraph("<b>GENERATED TIMESTAMP:</b>", body_style),
            Paragraph(timestamp_str, body_style),
        ],
        [
            Paragraph("<b>INCIDENT COMMANDER / OFFICER:</b>", body_style),
            Paragraph(officer_name, body_bold),
            Paragraph("<b>RIVER BASIN DIVISION:</b>", body_style),
            Paragraph(
                f"{village_data.get('river', 'Damodar River')} / Hooghly Command",
                body_style,
            ),
        ],
    ]

    meta_table = Table(meta_data, colWidths=[140, 130, 130, 122])
    meta_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT),
                ("BOX", (0, 0), (-1, -1), 1, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # 3. Assessment Metrics Table
    story.append(Paragraph("I. GEOSPATIAL & CROP DAMAGE IMPACT METRICS", section_header_style))

    flooded_acres = village_data.get("flooded_acres", 18.2)
    crop_loss_pct = village_data.get("cropLossPct", 42.5)
    farmers_count = village_data.get("farmersCount", 240)
    threat_level = village_data.get("threatLevel", "CRITICAL")
    block_name = village_data.get("block", "Khanakul-I")
    village_name = village_data.get("name", "Khanakul")
    district_name = village_data.get("district", "Hooghly")

    metrics_data = [
        [
            Paragraph("<b>Parameter</b>", body_bold),
            Paragraph("<b>Observed Field Data</b>", body_bold),
            Paragraph("<b>Severity Status</b>", body_bold),
        ],
        [
            Paragraph("Target Village & Block", body_style),
            Paragraph(f"{village_name}, Block {block_name} ({district_name})", body_style),
            Paragraph(f"<b>{threat_level}</b>", body_bold),
        ],
        [
            Paragraph("Primary Standing Crop", body_style),
            Paragraph("Aman Paddy / Kharif Vegetables", body_style),
            Paragraph("High Vulnerability", body_style),
        ],
        [
            Paragraph("Sentinel-1 SAR Flooded Area", body_style),
            Paragraph(f"<b>{flooded_acres} Acres</b>", body_bold),
            Paragraph("Submerged Cropland", body_style),
        ],
        [
            Paragraph("Estimated Crop Loss Percentage", body_style),
            Paragraph(f"<b>{crop_loss_pct}% Damage</b>", body_bold),
            Paragraph("Relief Threshold Exceeded", body_style),
        ],
        [
            Paragraph("Impacted Farmer Households", body_style),
            Paragraph(f"<b>{farmers_count} Registered Farmers</b>", body_bold),
            Paragraph("Direct Beneficiaries", body_style),
        ],
        [
            Paragraph("Observed Flood Water Depth", body_style),
            Paragraph("1.2m - 1.8m (Overbank Inundation)", body_style),
            Paragraph("Critical Breach", body_style),
        ],
    ]

    metrics_table = Table(metrics_data, colWidths=[170, 222, 130])
    metrics_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                ("BOX", (0, 0), (-1, -1), 1, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    story.append(metrics_table)
    story.append(Spacer(1, 10))

    # 4. Citizen Advisory & Rescue Dispatch Section
    story.append(Paragraph("II. EMERGENCY CITIZEN ADVISORY & RESCUE DISPATCH", section_header_style))

    bengali_text = village_data.get(
        "smsBengali",
        "জরুরি সতর্কতা: দামোদর ও মুণ্ডেশ্বরী নদীর জল স্তর দ্রুত বাড়ছে। নিচু এলাকার কৃষকদের অবিলম্বে নিকটবর্তী ত্রিপল ও ত্রাণ শিবিরে আশ্রয় নেওয়ার অনুরোধ করা হচ্ছে।",
    )

    advisory_content = [
        [
            Paragraph("<b>Localized Bengali IVR / SMS Broadcast Alert:</b>", body_bold),
        ],
        [
            Paragraph(f"<i>\"{bengali_text}\"</i>", body_style),
        ],
    ]

    advisory_table = Table(advisory_content, colWidths=[522])
    advisory_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(advisory_table)
    story.append(Spacer(1, 8))

    dispatch_info = [
        [
            Paragraph("<b>Assigned Rescue Depot:</b>", body_style),
            Paragraph("Arambagh NDRF 2nd Battalion Depot", body_bold),
            Paragraph("<b>Transit Distance & ETA:</b>", body_style),
            Paragraph("21.3 km • 41 Minutes Arrival", body_bold),
        ],
        [
            Paragraph("<b>Rescue Equipment:</b>", body_style),
            Paragraph("2 Motorized Speedboats, First Aid Kits", body_style),
            Paragraph("<b>Dispatch Status:</b>", body_style),
            Paragraph("<font color='#047857'><b>DISPATCHED & ACTIVE</b></font>", body_style),
        ],
    ]

    dispatch_table = Table(dispatch_info, colWidths=[130, 140, 130, 122])
    dispatch_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#ecfdf5")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#a7f3d0")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#6ee7b7")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(dispatch_table)
    story.append(Spacer(1, 24))

    # 5. Official Signatures Footer
    sig_data = [
        [
            Paragraph("__________________________________________<br/><b>Field Agricultural Officer</b><br/>Department of Agriculture, West Bengal", body_style),
            Paragraph("__________________________________________<br/><b>Block Development Officer (BDO)</b><br/>Incident Commander, Hooghly Division", body_style),
        ]
    ]
    sig_table = Table(sig_data, colWidths=[261, 261])
    sig_table.setStyle(
        TableStyle(
            [
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )

    story.append(KeepTogether([sig_table]))

    doc.build(story)
    buffer.seek(0)
    return buffer
