COMPOSE_PATH := ./docker-compose.yml

all: up
restart: down up

up:
	docker compose -f $(COMPOSE_PATH) up --build -d --remove-orphans

down:
	docker compose -f $(COMPOSE_PATH) down

clean:
	docker compose -f $(COMPOSE_PATH) down -v --remove-orphans	

fclean: clean
	docker compose -f $(COMPOSE_PATH) down --rmi local -v --remove-orphans

purge: fclean
	rm -rf ./ai_models
	docker system prune -af --volumes

logs:
	docker compose -f $(COMPOSE_PATH) logs -f

re: fclean up

.PHONY: all up down restart clean fclean logs re