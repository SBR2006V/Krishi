import os
import json
import logging
from pydantic import BaseModel
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class AdvisoryResponse(BaseModel):
    sms_bengali: str
    voice_transcript_bengali: str
    bdo_summary: str

def generate_village_advisory(village_data: dict) -> dict:
    """
    Generates a live multilingual Bengali flood advisory and BDO executive summary
    using Gemini 2.5 Flash with structured JSON output.
    """
    v_name = village_data.get("village_name") or village_data.get("name") or "Gram"
    block = village_data.get("block") or "District Block"
    acres = village_data.get("flooded_acres") or village_data.get("inundated_acreage") or 0
    crop = village_data.get("crop") or village_data.get("standing_crop") or "Standing Crop"
    loss_pct = village_data.get("estimated_crop_loss_pct") or village_data.get("crop_loss_pct") or 0
    farmers = village_data.get("impacted_farmers") or village_data.get("impacted_households") or 0
    water_depth = village_data.get("water_depth") or "1.5m"
    severity = village_data.get("severity") or village_data.get("risk_level") or "CRITICAL"

    fallback_sms = f"জরুরি সতর্কবার্তা: {block} ব্লকের {v_name} গ্রামে {water_depth} জল বৃদ্ধি পেয়েছে। {crop} ফসল {loss_pct}% ক্ষতিগ্রস্ত। নিকটস্থ ত্রাণ শিবিরে আশ্রয় নিন।"
    fallback_voice = f"নমস্কার, কৃষি ও বিপর্যয় মোকাবিলা দপ্তর থেকে জরুরি ঘোষণা। {v_name} গ্রামের কৃষকদের জানানো হচ্ছে যে বন্যায় {acres} একর জমি প্লাবিত হয়েছে। অনতিবিলম্বে নিরাপদ উঁচু স্থানে চলে যান এবং পশুসম্পদ সুরক্ষিত করুন। ত্রাণ ও উদ্ধারকারী দল রওনা হয়েছে।"
    fallback_summary = f"Village {v_name} in {block} Block has reached {severity} status ({acres} acres inundated, {loss_pct}% {crop} damage). Impacting {farmers} households. NDRF rescue dispatch initiated."

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not set in environment. Returning fallback advisory.")
        return {
            "sms_bengali": fallback_sms,
            "voice_transcript_bengali": fallback_voice,
            "bdo_summary": fallback_summary,
        }

    try:
        client = genai.Client(api_key=api_key)
        prompt = f"""
        Act as the Emergency Disaster Management & Agricultural Relief Officer for the Government of West Bengal (Hooghly & Damodar Basin Division).
        Generate an urgent flood advisory and administrative summary based on the following real-time Sentinel-1 SAR telemetry:
        
        - Village Name: {v_name}
        - Sub-District / Block: {block}
        - Flooded Acreage: {acres} acres
        - Primary Crop Type: {crop}
        - Estimated Crop Loss: {loss_pct}%
        - Impacted Farmer Households: {farmers}
        - Flood Water Depth: {water_depth}
        - Disaster Severity Level: {severity}

        Provide a structured JSON response containing:
        1. "sms_bengali": Urgent localized Bengali SMS alert text (max 160 characters) instructing farmers to move livestock and seek shelter.
        2. "voice_transcript_bengali": Full official emergency voice announcement in formal clear Bengali to be broadcasted via automated IVR call.
        3. "bdo_summary": A concise high-priority Executive Action Summary in English for the Block Development Officer (BDO) detailing severity, damage, and immediate dispatch needs.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AdvisoryResponse,
                temperature=0.3,
            ),
        )

        if response.text:
            parsed = json.loads(response.text)
            return {
                "sms_bengali": parsed.get("sms_bengali", fallback_sms),
                "voice_transcript_bengali": parsed.get("voice_transcript_bengali", fallback_voice),
                "bdo_summary": parsed.get("bdo_summary", fallback_summary),
            }
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}", exc_info=True)

    return {
        "sms_bengali": fallback_sms,
        "voice_transcript_bengali": fallback_voice,
        "bdo_summary": fallback_summary,
    }
