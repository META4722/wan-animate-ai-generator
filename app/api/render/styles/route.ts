import { NextResponse } from 'next/server';

// Available rendering styles and their configurations
const RENDER_STYLES = {
  text: [
    {
      id: 'realistic',
      name: 'Realistic',
      description: 'Photorealistic architectural rendering',
      icon: '/icons/Realistic_Icon@2x.webp',
      prompts: {
        prefix: 'photorealistic architectural rendering',
        suffix: 'high quality, detailed, professional'
      }
    },
    {
      id: 'night',
      name: 'Night',
      description: 'Dramatic night scene with lighting',
      icon: '/icons/Night_Icon@2x.webp',
      prompts: {
        prefix: 'night scene architectural rendering',
        suffix: 'dramatic lighting, illuminated windows, ambient lighting'
      }
    },
    {
      id: 'snow',
      name: 'Snow',
      description: 'Winter scene with snow',
      icon: '/icons/Snow_Icon@2x.webp',
      prompts: {
        prefix: 'winter architectural rendering',
        suffix: 'covered in snow, winter atmosphere, cold lighting'
      }
    },
    {
      id: 'rain',
      name: 'Rain',
      description: 'Rainy weather with wet surfaces',
      icon: '/icons/Rain_Icon@2x.webp',
      prompts: {
        prefix: 'rainy day architectural rendering',
        suffix: 'wet surfaces, rain effects, overcast sky'
      }
    }
  ],
  sketch: [
    {
      id: 'realistic',
      name: 'Realistic',
      description: 'Convert sketch to photorealistic',
      icon: '/icons/Realistic_Icon@2x.webp',
      prompts: {
        prefix: 'convert architectural sketch to photorealistic rendering',
        suffix: 'detailed, realistic materials and lighting'
      }
    },
    {
      id: 'night',
      name: 'Night',
      description: 'Nighttime realistic rendering',
      icon: '/icons/Night_Icon@2x.webp',
      prompts: {
        prefix: 'convert architectural sketch to night scene rendering',
        suffix: 'dramatic night lighting, illuminated'
      }
    },
    {
      id: 'snow',
      name: 'Snow',
      description: 'Winter scene rendering',
      icon: '/icons/Snow_Icon@2x.webp',
      prompts: {
        prefix: 'convert architectural sketch to winter scene',
        suffix: 'snow covered, winter atmosphere'
      }
    },
    {
      id: 'rain',
      name: 'Rain',
      description: 'Rainy day rendering',
      icon: '/icons/Rain_Icon@2x.webp',
      prompts: {
        prefix: 'convert architectural sketch to rainy scene',
        suffix: 'wet surfaces, rain effects'
      }
    }
  ],
  elevation: [
    {
      id: 'realistic',
      name: 'Realistic',
      description: 'Transform elevation to 3D realistic',
      icon: '/icons/Realistic_Icon@2x.webp',
      prompts: {
        prefix: 'transform architectural elevation to photorealistic 3D rendering',
        suffix: 'dimensional, realistic perspective'
      }
    },
    {
      id: 'night',
      name: 'Night',
      description: 'Night elevation rendering',
      icon: '/icons/Night_Icon@2x.webp',
      prompts: {
        prefix: 'transform elevation to night scene 3D rendering',
        suffix: 'night lighting, dramatic shadows'
      }
    },
    {
      id: 'snow',
      name: 'Snow',
      description: 'Winter elevation rendering',
      icon: '/icons/Snow_Icon@2x.webp',
      prompts: {
        prefix: 'transform elevation to winter 3D scene',
        suffix: 'snow covered building'
      }
    },
    {
      id: 'rain',
      name: 'Rain',
      description: 'Rainy elevation rendering',
      icon: '/icons/Rain_Icon@2x.webp',
      prompts: {
        prefix: 'transform elevation to rainy 3D scene',
        suffix: 'wet building surfaces, rain'
      }
    }
  ],
  exterior: [
    {
      id: 'realistic',
      name: 'Realistic',
      description: 'Realistic exterior design',
      icon: '/icons/Realistic_Icon@2x.webp',
      prompts: {
        prefix: 'exterior architectural design',
        suffix: 'realistic materials, proper lighting'
      }
    },
    {
      id: 'night',
      name: 'Night',
      description: 'Night exterior scene',
      icon: '/icons/Night_Icon@2x.webp',
      prompts: {
        prefix: 'night exterior architectural design',
        suffix: 'artificial lighting, night ambiance'
      }
    },
    {
      id: 'snow',
      name: 'Snow',
      description: 'Winter exterior design',
      icon: '/icons/Snow_Icon@2x.webp',
      prompts: {
        prefix: 'winter exterior architectural design',
        suffix: 'snow landscape, winter setting'
      }
    },
    {
      id: 'rain',
      name: 'Rain',
      description: 'Rainy exterior scene',
      icon: '/icons/Rain_Icon@2x.webp',
      prompts: {
        prefix: 'rainy exterior architectural design',
        suffix: 'wet pavement, rain atmosphere'
      }
    }
  ],
  interior: [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary interior design',
      icon: '/icons/Modern_Icon@2x.webp',
      prompts: {
        prefix: 'modern interior architectural design',
        suffix: 'contemporary furniture, clean lines'
      }
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      description: 'Clean minimalist interior',
      icon: '/icons/Minimalist_Icon@2x.webp',
      prompts: {
        prefix: 'minimalist interior architectural design',
        suffix: 'simple, clean, uncluttered space'
      }
    },
    {
      id: 'neoclassical',
      name: 'Neoclassical',
      description: 'Classical elegant interior',
      icon: '/icons/Neoclassical_Icon@2x.webp',
      prompts: {
        prefix: 'neoclassical interior architectural design',
        suffix: 'elegant, classical elements, luxurious'
      }
    },
    {
      id: 'industrial',
      name: 'Industrial',
      description: 'Industrial style interior',
      icon: '/icons/Industrial_Icon@2x.webp',
      prompts: {
        prefix: 'industrial interior architectural design',
        suffix: 'exposed materials, urban, raw textures'
      }
    }
  ]
};

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Square', size: '1x1' },
  { id: '4:3', name: 'Standard', size: '4x3' },
  { id: '3:2', name: 'Photo', size: '3x2' },
  { id: '16:9', name: 'Widescreen', size: '16x9' }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        styles: RENDER_STYLES,
        aspectRatios: ASPECT_RATIOS,
        supportedTypes: Object.keys(RENDER_STYLES)
      }
    });

  } catch (error: any) {
    console.error('Styles API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve style configurations',
        details: error.message
      },
      { status: 500 }
    );
  }
}