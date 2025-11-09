from PIL import Image, ImageDraw, ImageFont
import os

# Create screenshots directory if not exists
os.makedirs('public/screenshots', exist_ok=True)

def create_screenshot(width, height, title, subtitle, filename):
    """Create a placeholder screenshot with gradient background"""
    
    # Create image with gradient
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background (green theme)
    for y in range(height):
        # Gradient from #16a34a to #15803d
        r = int(22 + (21 - 22) * y / height)
        g = int(163 + (128 - 163) * y / height)
        b = int(74 + (61 - 74) * y / height)
        draw.rectangle([(0, y), (width, y + 1)], fill=(r, g, b))
    
    # Try to use a nice font, fall back to default if not available
    try:
        title_font = ImageFont.truetype("arial.ttf", 48 if width > 1000 else 36)
        subtitle_font = ImageFont.truetype("arial.ttf", 32 if width > 1000 else 24)
        footer_font = ImageFont.truetype("arial.ttf", 20 if width > 1000 else 16)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        footer_font = ImageFont.load_default()
    
    # Draw app name
    app_name = "Smart Krishi Sahayak"
    bbox = draw.textbbox((0, 0), app_name, font=title_font)
    text_width = bbox[2] - bbox[0]
    draw.text(((width - text_width) // 2, height // 4), app_name, fill='white', font=title_font)
    
    # Draw title
    bbox = draw.textbbox((0, 0), title, font=subtitle_font)
    text_width = bbox[2] - bbox[0]
    draw.text(((width - text_width) // 2, height // 2), title, fill='white', font=subtitle_font)
    
    # Draw subtitle
    bbox = draw.textbbox((0, 0), subtitle, font=footer_font)
    text_width = bbox[2] - bbox[0]
    draw.text(((width - text_width) // 2, height // 2 + 60), subtitle, fill=(255, 255, 255), font=footer_font)
    
    # Draw icon placeholder (white square)
    icon_size = 120 if width > 1000 else 100
    icon_x = (width - icon_size) // 2
    icon_y = height // 2 + 120
    draw.rectangle([icon_x, icon_y, icon_x + icon_size, icon_y + icon_size], 
                   fill=(200, 220, 200))
    
    # Draw footer
    footer_text = "Agriculture Assistant for Indian Farmers"
    bbox = draw.textbbox((0, 0), footer_text, font=footer_font)
    text_width = bbox[2] - bbox[0]
    draw.text(((width - text_width) // 2, height - 100), footer_text, 
             fill=(255, 255, 255), font=footer_font)
    
    # Save image
    img.save(f'public/screenshots/{filename}')
    print(f'✅ Created: {filename} ({width}x{height})')

# Create all screenshots
print('Creating PWA screenshots...\n')

create_screenshot(1280, 720, 'Dashboard', 
                 'Weather • Crops • Quick Actions', 'dashboard.png')

create_screenshot(750, 1334, 'AI Disease Detection', 
                 'Scan crop leaves for instant diagnosis', 'disease-detection.png')

create_screenshot(750, 1334, 'Live Weather', 
                 'Real-time forecast with 7-day predictions', 'weather.png')

create_screenshot(750, 1334, 'Market Prices', 
                 'Latest mandi rates and price trends', 'market-prices.png')

print('\n✅ All screenshots created successfully!')
print('📁 Location: public/screenshots/')
print('📝 Note: Replace these placeholders with actual app screenshots for production')
