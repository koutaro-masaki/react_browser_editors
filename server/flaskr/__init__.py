import os
import click

from flask import Flask, request, Markup, abort, jsonify
from flask.cli import with_appcontext
from .models.work import Work
from .db import db, init_db


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        JSON_AS_ASCII=False
    )
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///flaskr.sqlite'

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    init_db(app)

    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    # APIテスト
    @app.route('/work/<id>', methods=['GET', 'PUT'])
    def get_or_put(id):
        work = db.session.query(Work).get(id)
        if work is None:
            abort(404)

        if request.method == 'GET':
            return jsonify({
                'html': work.html,
                'css': work.css,
                'javascript': work.javascript
            }), 200
        elif request.method == 'PUT':
            json = request.get_json()

            if 'html' not in json:
                return jsonify({
                    'error': '不正なパラメータ',
                    'message': "'html'フィールドが定義されていません"
                }), 400
            if 'css' not in json:
                return jsonify({
                    'error': '不正なパラメータ',
                    'message': "'css'フィールドが定義されていません"
                }), 400
            if 'javascript' not in json:
                return jsonify({
                    'error': '不正なパラメータ',
                    'message': "'javascript'フィールドが定義されていません"
                }), 400

            work.html = json['html']
            work.css = json['css']
            work.javascript = json['javascript']

            # ここの処理で例外が出る可能性？
            db.session.add(work)
            db.session.commit()
            db.session.close()
            return jsonify({}), 200
        else:
            return abort(400)

    @app.route('/work', methods=['POST'])
    def post():
        if request.method == 'POST':
            json = request.get_json()

            if 'html' not in json:
                return jsonify({
                    'error': '不正なパラメータ',
                    'message': "'html'フィールドが定義されていません"
                }), 400
            if 'css' not in json:
                return jsonify({
                    'error': '不正なパラメータ',
                    'message': "'css'フィールドが定義されていません"
                }), 400
            if 'javascript' not in json:
                return jsonify({
                    'error': '不正なパラメータ',
                    'message': "'javascript'フィールドが定義されていません"
                }), 400

            work = Work(html=json['html'], css=json['css'],
                        javascript=json['javascript'])

            # ここの処理で例外が出る可能性？
            db.session.add(work)
            db.session.flush()
            db.session.commit()

            # sessionを閉じるとデータが取得できなくなるのでこのタイミングで格納しておく
            result = {
                'id': work.id
            }
            db.session.close()
            return jsonify(result), 200

    return app
