# Figma AI Assistant - Plugin

## 🔧 Instalação

1. **Abra o Figma Desktop**
2. Vá em **Plugins** → **Development** → **Import plugin from manifest...**
3. Selecione o arquivo **`manifest.json`** desta pasta
4. Pronto! O plugin estará disponível em **Plugins** → **Figma AI Assistant**

## ⚙️ Configuração

O plugin precisa do **backend rodando** para funcionar.

### Iniciar Backend:

```bash
docker pull gbueno10/figma-ai-backend:latest
docker run -d -p 3000:3000 -e OPENAI_API_KEY=sua-chave-aqui --name figma-ai-backend gbueno10/figma-ai-backend:latest
```

### Obter chave OpenAI:
https://platform.openai.com/api-keys

## 📡 Endpoints

O plugin se conecta ao backend em: `http://localhost:3000`

Certifique-se de que o backend está rodando antes de usar o plugin!

## 🆘 Troubleshooting

### "Failed to connect to backend"
- Verifique se o Docker está rodando: `docker ps`
- Teste o health check: `curl http://localhost:3000/health`
- Veja os logs: `docker logs figma-ai-backend`

### "Invalid API Key"
- Verifique se a `OPENAI_API_KEY` está correta
- Gere uma nova chave em: https://platform.openai.com/api-keys

