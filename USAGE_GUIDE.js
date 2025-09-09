// Exemplo de como usar o plugin para gerar JSON estruturado

/*
INSTRUÇÕES DE USO:

1. Abra o Figma
2. Selecione um frame com design
3. Carregue o plugin AI Design Assistant
4. Clique em "📸 Analisar Design"
5. O plugin irá:
   - Capturar screenshot do frame
   - Analisar toda a estrutura
   - Categorizar elementos (texto, botões, containers, etc.)
   - Detectar padrões de design
   - Analisar acessibilidade
   - Gerar JSON estruturado

EXEMPLO DE OUTPUT JSON:
*/

const exampleOutput = {
  // Informações básicas do design
  "design": {
    "id": "frame_abc123",
    "name": "Landing Page Hero",
    "dimensions": { "width": 1200, "height": 600 },
    "timestamp": "2025-09-09T15:30:00.000Z"
  },
  
  // Resumo estatístico
  "summary": {
    "totalElements": 12,
    "elementTypes": {
      "text": 4,        // Elementos de texto
      "buttons": 2,    // Botões detectados
      "images": 1,     // Imagens
      "containers": 3, // Containers/frames
      "shapes": 2,     // Formas geométricas
      "icons": 0       // Ícones
    },
    "complexity": "medium",           // low/medium/high
    "layoutType": "horizontal",       // horizontal/vertical/absolute
    "colorPalette": ["#ffffff", "#1976d2", "#333333"]
  },
  
  // Elementos organizados por categoria (fácil para IA processar)
  "elements": {
    "texts": [
      {
        "id": "text_001",
        "name": "Main Headline",
        "content": "Revolucione seu negócio",
        "fontSize": 48,
        "fontFamily": "Inter",
        "position": { "x": 100, "y": 80 },
        "dimensions": { "width": 600, "height": 60 }
      }
    ],
    "buttons": [
      {
        "id": "btn_001", 
        "name": "CTA Button",
        "position": { "x": 100, "y": 200 },
        "dimensions": { "width": 180, "height": 44 },
        "style": {
          "fills": [{ "type": "solid", "color": "#1976d2" }],
          "cornerRadius": 8
        }
      }
    ],
    "containers": [
      {
        "id": "container_001",
        "name": "Hero Section",
        "layout": {
          "mode": "HORIZONTAL",
          "spacing": 24,
          "padding": { "top": 40, "right": 80, "bottom": 40, "left": 80 }
        }
      }
    ]
  },
  
  // Padrões detectados automaticamente
  "patterns": {
    "hasHeader": true,
    "hasFooter": false,
    "hasNavigation": true,
    "hasCTA": true,
    "hasCards": false,
    "hasForm": false,
    "layoutPattern": "header-content-footer"
  },
  
  // Análise de acessibilidade
  "accessibility": {
    "fontSizes": [48, 16, 14],
    "hasProperHierarchy": true,
    "recommendations": [
      "Alguns textos podem estar muito pequenos (< 12px)",
      "Considere usar diferentes tamanhos de fonte para criar hierarquia visual"
    ]
  },
  
  // Contexto para IA
  "context": {
    "purpose": "Design analysis for AI suggestions",
    "requestedImprovements": [
      "Visual hierarchy optimization",
      "UX/UI best practices compliance",
      "Accessibility improvements", 
      "Design system consistency",
      "Content and copy suggestions"
    ]
  }
};

/*
COMO ENVIAR PARA IA:

1. Use o botão "📄 Exportar JSON" no plugin
2. Copie o JSON gerado
3. Envie para ChatGPT, Claude ou qualquer IA com prompt como:

"Analise este design Figma e sugira melhorias baseadas em UX/UI best practices:
[COLAR JSON AQUI]

Por favor, analise:
- Hierarquia visual
- Acessibilidade  
- Padrões de design
- Consistência
- Sugestões de conteúdo"

A IA terá contexto completo e estruturado para dar sugestões precisas!
*/

export { exampleOutput };
