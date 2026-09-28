import io
import os
import base64
import html
import logging
from typing import Dict, Any
from PIL import Image
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    KeepTogether,
    HRFlowable
)
from config import settings

logger = logging.getLogger(__name__)

def clean_xml(val: Any) -> str:
    """Safely escapes text for ReportLab XML parsing and replaces problematic unicode."""
    if val is None:
        return ""
    text = str(val).strip()
    # Normalize unicode arrows and em-dashes
    text = text.replace('\u2192', '->').replace('\u2014', ' - ').replace('\u2013', ' - ')
    return html.escape(text)

def generate_pdf_report(analysis: Dict[str, Any]) -> bytes:
    """
    Builds a professional executive SatQueryAI Remote-Sensing Intelligence Report PDF.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    story = []
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b')
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0284c7'),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#475569')
    )

    loc = analysis.get("location", {})
    loc_name = clean_xml(loc.get("name", "Unknown AOI"))
    country = clean_xml(loc.get("country", ""))
    before_d = clean_xml(analysis.get("actual_before_date", ""))
    after_d = clean_xml(analysis.get("actual_after_date", ""))
    conf = analysis.get("confidence", {})
    ai_sum = analysis.get("ai_summary", {})

    # Header Banner
    story.append(Paragraph("SATQUERYAI — AUTONOMOUS EARTH INTELLIGENCE", subtitle_style))
    story.append(Paragraph(f"Earth Observation Analysis Report: {loc_name}", title_style))
    sensor_name = clean_xml(analysis.get('imagery_source', 'Copernicus Sentinel-2'))
    story.append(Paragraph(f"Monitoring Period: {before_d} -> {after_d} | Sensor: {sensor_name}", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=12))

    # Executive Summary Card
    story.append(Paragraph("1. EXECUTIVE AI SUMMARY", heading_style))
    headline = clean_xml(ai_sum.get('headline', ''))
    observed = clean_xml(ai_sum.get('observed', ''))
    interpretation = clean_xml(ai_sum.get('interpretation', ''))
    story.append(Paragraph(f"<b>Key Finding:</b> {headline}", body_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(observed, body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<b>Scientific Interpretation:</b> {interpretation}", callout_style))
    story.append(Spacer(1, 10))

    # Imagery Snapshots
    story.append(Paragraph("2. MULTISPECTRAL OBSERVATION PAIR", heading_style))
    layers = analysis.get("visual_layers", {})
    before_b64 = layers.get("before_rgb")
    after_b64 = layers.get("after_rgb")
    heatmap_b64 = layers.get("change_heatmap")

    img_elements = []
    temp_files = []

    def b64_to_rl_image(b64_str, max_w=150, max_h=150):
        if not b64_str or not b64_str.startswith("data:image"):
            return Paragraph("[Image Unavailable]", body_style)
        try:
            header, data = b64_str.split(",", 1)
            raw = base64.b64decode(data)
            p_img = Image.open(io.BytesIO(raw))
            settings.CACHE_DIR.mkdir(parents=True, exist_ok=True)
            tmp_path = str(settings.CACHE_DIR / f"temp_{os.urandom(6).hex()}.png")
            p_img.save(tmp_path)
            temp_files.append(tmp_path)
            return RLImage(tmp_path, width=max_w, height=max_h)
        except Exception as err:
            logger.warning(f"Error decoding image for report: {err}")
            return Paragraph("[Image Error]", body_style)

    img_before = b64_to_rl_image(before_b64, 160, 160)
    img_after = b64_to_rl_image(after_b64, 160, 160)
    img_heatmap = b64_to_rl_image(heatmap_b64, 160, 160)

    img_table_data = [
        [img_before, img_after, img_heatmap],
        [
            Paragraph(f"<b>BEFORE ({before_d})</b><br/>True-Color Sentinel-2", subtitle_style),
            Paragraph(f"<b>AFTER ({after_d})</b><br/>True-Color Sentinel-2", subtitle_style),
            Paragraph("<b>CHANGE HEATMAP</b><br/>Multi-Index Delta", subtitle_style)
        ]
    ]
    img_table = Table(img_table_data, colWidths=[175, 175, 175])
    img_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(img_table)
    story.append(Spacer(1, 12))

    # Land Cover Statistics Table
    story.append(Paragraph("3. LAND COVER METRICS & DELTAS", heading_style))
    stats = analysis.get("land_cover_stats", [])
    table_data = [["Category", "Before (ha)", "After (ha)", "Net Delta (ha)", "Relative Change"]]
    for s in stats:
        table_data.append([
            s.get("category", ""),
            f"{s.get('before_ha', 0):.1f}",
            f"{s.get('after_ha', 0):.1f}",
            f"{s.get('change_ha', 0):+.1f}",
            f"{s.get('change_pct', 0):+.1f}%"
        ])

    stat_table = Table(table_data, colWidths=[150, 90, 90, 95, 95])
    stat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(stat_table)
    story.append(Spacer(1, 10))

    # Detected Change Regions Top List
    story.append(Paragraph("4. SIGNIFICANT CHANGE POLYGONS (TOP DETECTED CLUSTERS)", heading_style))
    regions = analysis.get("change_regions", [])[:5]
    if regions:
        cr_data = [["ID", "Category", "Area (ha)", "Coordinates", "NDBI Delta", "NDVI Delta", "Confidence"]]
        for r in regions:
            c = r.get("centroid", [0, 0])
            cr_data.append([
                r.get("id", ""),
                r.get("user_label", ""),
                f"{r.get('area_hectares', 0):.1f}",
                f"{c[1]:.4f}, {c[0]:.4f}",
                f"{r.get('delta_ndbi', 0):+.2f}",
                f"{r.get('delta_ndvi', 0):+.2f}",
                f"{r.get('confidence_pct', 0)}%"
            ])
        cr_table = Table(cr_data, colWidths=[45, 120, 60, 110, 65, 65, 60])
        cr_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(cr_table)
    else:
        story.append(Paragraph("No anomalous change clusters exceeded the statistical threshold in this period.", body_style))
    story.append(Spacer(1, 10))

    # Provenance & Confidence
    story.append(Paragraph("5. DATA PROVENANCE & CONFIDENCE TELEMETRY", heading_style))
    score = conf.get("overall_score", 85)
    rating = clean_xml(conf.get("rating", "High"))
    prov_text = (
        f"<b>Confidence Rating:</b> {score}% ({rating})<br/>"
        f"<b>Imagery Source:</b> {sensor_name} (GSD: {clean_xml(analysis.get('resolution', '10m'))})<br/>"
        f"<b>Cloud Cover:</b> Baseline {analysis.get('cloud_percentage_before', 0)}% | Comparative {analysis.get('cloud_percentage_after', 0)}%<br/>"
        f"<b>AOI Bounding Box:</b> {clean_xml(str(analysis.get('location', {}).get('bounding_box', [])))}<br/>"
        f"<b>Algorithms:</b> Normalized Difference Indices (NDVI, NDWI, NDBI), Morphological Cluster Filtering, Connected Components."
    )
    story.append(Paragraph(prov_text, body_style))
    story.append(Spacer(1, 6))

    lims = conf.get("limitations", [])
    clean_lims = " ".join([clean_xml(l) for l in lims]) if lims else "No critical scientific anomalies noted."
    lim_text = f"<b>Scientific Limitations:</b> {clean_lims}"
    story.append(Paragraph(lim_text, callout_style))

    # Build PDF
    try:
        doc.build(story)
        pdf_bytes = buffer.getvalue()
    finally:
        # Clean up temporary image files
        for f in temp_files:
            try:
                if os.path.exists(f):
                    os.remove(f)
            except Exception:
                pass

    return pdf_bytes
