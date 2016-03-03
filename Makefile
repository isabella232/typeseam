# assumes several environmental variables are set
# DB_NAME

install:
	pip install -r requirements.txt

install.travis:
	pip install -r requirements/ci.txt

install.dev:
	pip install -r requirements/dev.txt
	npm install

db.drop:
	rm -rf ./migrations
	dropdb $(DB_NAME) --if-exists

db.create:
	createdb $(DB_NAME)

db.init:
	python manage.py db init
	python manage.py db migrate
	python manage.py db upgrade

db.rebuild:
	make db.drop
	make db.create
	make db.init

serve:
	gulp

test:
	dropdb test_$(DB_NAME) --if-exists
	createdb test_$(DB_NAME)
	nosetests ./tests/ \
		--eval-attr "not selenium" \
		--verbose \
		--nocapture \
		--with-coverage \
		--cover-package=./typeseam \
		--cover-erase

test.specific:
	dropdb test_$(DB_NAME) --if-exists
	createdb test_$(DB_NAME)
	nosetests \
		$(CURRENT_TESTS) \
		--verbose \
		--nocapture

test.unit:
	nosetests \
		$(SCOPE) \
		--verbose \
		--nocapture

test.full:
	$(info This test requires the server to be running locally)
	dropdb test_$(DB_NAME) --if-exists
	createdb test_$(DB_NAME)
	nosetests \
		--verbose \
		--nocapture \
		--with-coverage \
		--cover-package=./typeseam \
		--cover-erase

test.travis:
	nosetests \
		--eval-attr "not selenium" \
		--verbose \
		--nocapture \
		--with-coverage \
		--cover-package=./typeseam

deploy.demo.static:
	gulp build
	aws s3 sync ./typeseam/static s3://typeseam-demo/static

deploy.prod.static:
	gulp build
	aws s3 sync ./typeseam/static s3://typeseam/static

deploy.demo:
	make deploy.demo.static
	git push demo master

deploy.prod:
	make deploy.prod.static
	git push production master

fake_data:
	python ./typeseam/scripts/load_fake_data.py

