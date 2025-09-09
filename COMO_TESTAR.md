# 🚀 Como Testar o Plugin e Ver o JSON na UI

## 📋 Pré-requisitos
1. Abra o Figma
2. Crie ou abra um arquivo com designs
3. Carregue o plugin como desenvolvedor

## 🔧 Como Carregar o Plugin

### Método 1: Via Menu do Figma
1. No Figma, vá em **Plugins** → **Development** → **Import plugin from manifest**
2. Selecione o arquivo `manifest.json` na pasta do projeto
3. O plugin "AI Design Assistant" aparecerá na lista

### Método 2: Via URL
1. No Figma, vá em **Plugins** → **Development** → **New Plugin**
2. Cole o caminho: `/Users/gbuenos/Documents/Projetos/figma-ai-assistant/manifest.json`

## 🎯 Como Usar e Ver o JSON

### Passo 1: Selecionar Frame
1. **Selecione um frame** no Figma (qualquer design)
2. **Execute o plugin** "AI Design Assistant"

### Passo 2: Analisar Design
1. Clique no botão **"📸 Analisar Design"**
2. O plugin irá:
   - Capturar screenshot
   - Analisar toda a estrutura
   - Gerar JSON estruturado
   - **Mostrar o JSON na interface**

### Passo 3: Visualizar JSON na UI
Após a análise, você verá na UI:

```
📊 Dados Estruturados
┌─────────────────┬─────────────┐
│ Elementos: 12   │ Textos: 4   │
│ Botões: 2       │ Containers: 3│
│ Complexidade: medium │ Layout: horizontal │
└─────────────────┴─────────────┘

JSON Estruturado:
{
  "design": {
    "id": "frame_abc123",
    "name": "Meu Frame",
    "dimensions": { "width": 1200, "height": 600 }
  },
  "summary": {
    "totalElements": 12,
    "elementTypes": {
      "text": 4,
      "buttons": 2,
      "containers": 3
    }
  },
  "elements": {
    "texts": [...],
    "buttons": [...],
    "containers": [...]
  }
  // ... resto do JSON
}
```

### Passo 4: Exportar JSON
1. Clique em **"📄 Exportar JSON"**
2. O JSON será **copiado para área de transferência**
3. Cole em qualquer editor para usar com IA

## 🎨 O Que o JSON Contém

### 📊 Informações Estruturadas:
- **Design**: ID, nome, dimensões
- **Resumo**: Estatísticas dos elementos
- **Elementos**: Organizados por categoria
  - Textos com conteúdo e tipografia
  - Botões com estilos e posição
  - Containers com layout e filhos
- **Padrões**: Header, footer, navegação detectados
- **Acessibilidade**: Análise de usabilidade

### 🤖 Pronto para IA:
O JSON é otimizado para enviar para:
- ChatGPT
- Claude
- Cualquer IA de análise

## 🐛 Solução de Problemas

### Plugin não aparece?
- Verifique se o arquivo `manifest.json` existe
- Certifique-se de que fez o build: `npm run build`

### Botão não funciona?
- Verifique se selecionou um **frame** (não grupos)
- Abra o console do navegador para ver erros

### JSON não aparece?
- O JSON aparece automaticamente após clicar "Analisar Design"
- Se não aparecer, verifique se há erros no console

## 📁 Arquivos Importantes
- `manifest.json` - Configuração do plugin
- `dist/code.js` - Lógica principal
- `dist/ui.html` - Interface com visualização do JSON
- `dist/ui.js` - JavaScript da interface

O plugin está **100% funcional** e pronto para mostrar o JSON estruturado na interface!
