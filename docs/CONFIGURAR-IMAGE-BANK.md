# 📁 Guia Rápido - Configurar Pasta do Image Bank

## 🎯 Onde Configurar a Pasta do Google Drive

### Opção 1: Pelo Indicador de Status (Novo! ✨)

No card **🎨 AI Image Generation**, você verá um indicador de status abaixo do checkbox de auto-save:

```
💾 Auto-save to Google Drive (Image Bank)
⚠️ Drive not configured. [Configure now]
```

**Clique em "Configure now"** e você será levado automaticamente para a seção de configuração do Drive!

---

### Opção 2: Manualmente Pelo Card do Drive

Role a página até encontrar o card:

```
☁️ Connect Google Drive
```

Siga os passos:

1. **Conectar ao Google Drive**
   - Clique em "🔗 Connect Google Drive"
   - Copie a URL que aparece
   - Cole no navegador
   - Autorize o acesso
   - Aguarde a confirmação automática

2. **Configurar a Pasta**
   - Após conectar, você verá o campo "Export Folder ID"
   - Abra o Google Drive no navegador
   - Navegue até a pasta onde quer salvar as imagens
   - Copie o ID da URL:
     ```
     https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j
                                            ^^^^^^^^^^^^^^^^^^
                                            Este é o ID!
     ```
   - Cole o ID no campo "Export Folder ID"
   - ✅ Pronto! O indicador mudará para verde

---

## 🔍 Status da Conexão

### No Card de Geração de Imagens

O indicador mostra 3 estados possíveis:

#### ⚠️ Drive não configurado
```
⚠️ Drive not configured. [Configure now]
```
- **Problema**: Você ainda não conectou o Google Drive
- **Ação**: Clique em "Configure now" para configurar

#### ⚠️ Drive conectado mas sem pasta
```
⚠️ Drive connected but no folder set. [Set folder]
```
- **Problema**: Google Drive conectado, mas falta definir a pasta
- **Ação**: Clique em "Set folder" para configurar a pasta

#### ✅ Tudo configurado
```
✅ Drive connected. Folder configured.
```
- **Status**: Pronto para uso!
- **Resultado**: Imagens serão salvas automaticamente

---

## 📝 Exemplo Completo de Setup

### Passo a Passo

1. **Abra o plugin no Figma**

2. **Role até o card "☁️ Connect Google Drive"**

3. **Clique em "🔗 Connect Google Drive"**
   - Uma URL será exibida
   - Copie a URL (botão "📋 Copy")

4. **Cole a URL no navegador**
   - Você será redirecionado para Google
   - Faça login se necessário
   - Clique em "Permitir" para autorizar

5. **Aguarde a confirmação**
   - O plugin detectará automaticamente
   - Status mudará para "✅ Google Drive Connected"

6. **Configure a pasta**
   - No Google Drive, abra a pasta "Image Bank" (ou crie uma)
   - Copie o ID da URL (exemplo: `1a2b3c4d5e6f7g8h9i0j`)
   - Cole no campo "Export Folder ID" do plugin
   - Pressione Enter ou clique fora do campo

7. **Verifique o status**
   - Role até o card "🎨 AI Image Generation"
   - Veja o indicador: deve mostrar "✅ Drive connected. Folder configured."

8. **Teste!**
   - Gere uma imagem: "A happy golden retriever puppy sitting"
   - Aguarde a geração
   - Veja as mensagens de auto-save aparecerem
   - Confira o arquivo no Google Drive!

---

## 🚨 Troubleshooting

### "Drive not configured" não muda

**Problema**: Indicador continua mostrando "not configured" mesmo após conectar

**Solução**:
1. Recarregue o plugin (Plugins → Development → Reload)
2. Verifique se a autorização foi concluída no navegador
3. Tente desconectar e reconectar

### "Drive connected but no folder set"

**Problema**: Drive conectado mas pasta não configurada

**Solução**:
1. Clique em "Set folder" no indicador
2. Cole o ID da pasta do Google Drive
3. Certifique-se de copiar apenas o ID (sem `https://` ou `/`)

### Indicador não aparece

**Problema**: Indicador de status não está visível

**Solução**:
1. Certifique-se de que fez `npm run build`
2. Recarregue o plugin no Figma
3. Verifique se está na versão mais recente

---

## 💡 Dicas

### Crie uma Pasta Dedicada

No Google Drive, crie uma pasta chamada "Figma Image Bank" para organizar melhor:

```
📁 Google Drive
  └─ 📁 Figma Image Bank
      └─ AI_dog_puppy_golden_sitting.png
      └─ AI_dog_adult_black_running.png
      └─ AI_dog_puppy_white_sleeping.png
```

### Mantenha o ID da Pasta Salvo

O plugin salva automaticamente o ID da pasta, então você só precisa configurar uma vez!

### Verifique Antes de Gerar

Antes de gerar muitas imagens, certifique-se de que o indicador mostra:
```
✅ Drive connected. Folder configured.
```

---

## 🎯 Resumo Visual

### Fluxo de Configuração

```
1. Plugin Aberto
   ↓
2. Card "☁️ Connect Google Drive"
   ↓
3. Clique "🔗 Connect"
   ↓
4. Copie URL → Cole no navegador
   ↓
5. Autorize no Google
   ↓
6. Plugin detecta automaticamente
   ↓
7. Cole ID da pasta no campo
   ↓
8. ✅ Status no card de Image Generation muda para verde
   ↓
9. Pronto para usar auto-save!
```

### Estados do Indicador

```
❌ Não configurado
   ↓ [Conectar Drive]
⚠️ Conectado sem pasta
   ↓ [Configurar pasta]
✅ Configurado e pronto!
```

---

## ✅ Checklist de Configuração

- [ ] Plugin aberto no Figma
- [ ] Cliquei em "Connect Google Drive"
- [ ] Copiei a URL de autorização
- [ ] Autorizei no navegador
- [ ] Status mudou para "Connected"
- [ ] Copiei o ID da pasta do Drive
- [ ] Colei o ID no campo "Export Folder ID"
- [ ] Indicador mostra "✅ Drive connected. Folder configured."
- [ ] Checkbox "Auto-save" está marcado ✅
- [ ] Testei gerando uma imagem

---

## 🎉 Pronto!

Agora você pode gerar imagens e elas serão automaticamente salvas no Google Drive com nomes inteligentes gerados por IA!

**Exemplo de uso**:
1. ✅ Marque "💾 Auto-save to Google Drive"
2. ✅ Verifique indicador verde
3. 🎨 Digite: "A playful brown puppy jumping"
4. 🚀 Clique "Generate Image"
5. ⏳ Aguarde...
6. ✅ Imagem salva como: `AI_dog_puppy_brown_jumping.png`

**Sem esforço manual! 🚀**
