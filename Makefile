.PHONY: help docker-build docker-up docker-down docker-restart docker-logs docker-clean plugin-build plugin-dev

# Cores para output
GREEN  := \033[0;32m
BLUE   := \033[0;34m
YELLOW := \033[1;33m
NC     := \033[0m # No Color

help: ## Mostra esta mensagem de ajuda
	@echo "$(BLUE)🐳 Figma AI Assistant - Comandos Disponíveis$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ========================================
# Docker Commands
# ========================================

docker-build: ## Build das imagens Docker
	@echo "$(BLUE)🔨 Building Docker images...$(NC)"
	@docker-compose build --no-cache

docker-up: ## Inicia o backend em Docker
	@echo "$(BLUE)🚀 Starting backend...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✅ Backend started at http://localhost:3000$(NC)"

docker-down: ## Para o backend
	@echo "$(YELLOW)🛑 Stopping backend...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Backend stopped$(NC)"

docker-restart: docker-down docker-up ## Reinicia o backend

docker-logs: ## Ver logs do backend
	@docker-compose logs --tail=100 backend

docker-logs-follow: ## Seguir logs em tempo real
	@docker-compose logs -f backend

docker-clean: ## Remove containers, volumes e imagens
	@echo "$(YELLOW)🗑️  Cleaning Docker resources...$(NC)"
	@docker-compose down -v
	@docker system prune -f
	@echo "$(GREEN)✅ Cleanup complete$(NC)"

docker-health: ## Verifica saúde do container
	@docker inspect --format='{{.State.Health.Status}}' figma-ai-backend || echo "Container not running"

# ========================================
# Plugin Commands
# ========================================

plugin-install: ## Instala dependências do plugin
	@echo "$(BLUE)📦 Installing plugin dependencies...$(NC)"
	@npm install
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

plugin-build: ## Build do plugin Figma
	@echo "$(BLUE)🔨 Building plugin...$(NC)"
	@npm run build
	@echo "$(GREEN)✅ Plugin built successfully$(NC)"

plugin-dev: ## Modo desenvolvimento do plugin
	@echo "$(BLUE)👨‍💻 Starting plugin in dev mode...$(NC)"
	@npm run dev

plugin-type-check: ## Verifica tipos TypeScript
	@echo "$(BLUE)🔍 Type checking...$(NC)"
	@npm run type-check

# ========================================
# Backend Commands (sem Docker)
# ========================================

backend-install: ## Instala dependências do backend
	@echo "$(BLUE)📦 Installing backend dependencies...$(NC)"
	@cd backend && npm install
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

backend-dev: ## Modo desenvolvimento do backend
	@echo "$(BLUE)👨‍💻 Starting backend in dev mode...$(NC)"
	@cd backend && npm run dev

backend-build: ## Build do backend
	@echo "$(BLUE)🔨 Building backend...$(NC)"
	@cd backend && npm run build
	@echo "$(GREEN)✅ Backend built$(NC)"

backend-start: ## Inicia backend em produção (local)
	@echo "$(BLUE)🚀 Starting backend...$(NC)"
	@cd backend && npm start

# ========================================
# Full Setup Commands
# ========================================

setup: plugin-install backend-install ## Setup completo do projeto
	@echo "$(GREEN)✅ Project setup complete!$(NC)"
	@echo ""
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "  1. Configure backend/.env with your OpenAI API key"
	@echo "  2. Run: make docker-up"
	@echo "  3. Build plugin: make plugin-build"
	@echo ""

start: docker-up ## Inicia o backend (Docker)
	@echo "$(GREEN)✅ Backend is running!$(NC)"
	@echo ""
	@echo "$(BLUE)Endpoints:$(NC)"
	@echo "  • Health: http://localhost:3000/health"
	@echo "  • Design: http://localhost:3000/api/design"
	@echo "  • Images: http://localhost:3000/api/images"
	@echo ""

stop: docker-down ## Para o backend

restart: docker-restart ## Reinicia o backend

logs: docker-logs-follow ## Ver logs (seguindo)

# ========================================
# Development Workflow
# ========================================

dev: ## Inicia ambiente de desenvolvimento completo
	@echo "$(BLUE)🚀 Starting development environment...$(NC)"
	@make docker-up
	@sleep 2
	@make plugin-dev

# ========================================
# Testing & Quality
# ========================================

test: ## Roda testes (quando implementados)
	@echo "$(YELLOW)⚠️  Tests not implemented yet$(NC)"

lint: ## Roda linter (quando implementado)
	@echo "$(YELLOW)⚠️  Linter not configured yet$(NC)"

# ========================================
# Default
# ========================================

.DEFAULT_GOAL := help
