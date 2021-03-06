import io
import os
import click
import zipfile

from flask import Flask, request, Markup, abort, jsonify
import flask
from flask.cli import with_appcontext
from flask.helpers import send_file
from flask.wrappers import Response
from flask_cors import CORS

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
    CORS(app)

    # a simple page that says hello

    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    # APIテスト
    @app.route('/work/<id>', methods=['GET', 'PUT'])
    def get_or_put_work(id):
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
            return jsonify({'id': id}), 200
        else:
            return abort(500)

    @app.route('/work', methods=['POST'])
    def new_work():
        if request.method == 'POST':
            work = Work()

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
        else:
            return abort(500)

    @app.route('/works', methods=['GET'])
    def get_work_id_list():
        ids = db.session.query(Work.id).all()
        return jsonify(list(map(lambda w: w.id, ids))), 200

    @app.route('/download/<id>', methods=['GET'])
    def get_zip(id):
        work = db.session.query(Work).get(id)
        if work is None:
            abort(404)

        # zipファイルを作成する
        zip_stream = io.BytesIO()
        with zipfile.ZipFile(zip_stream, 'w') as zip_temp:
            zip_temp.writestr('index.html', work.html)
            zip_temp.writestr('style.css', work.css)
            zip_temp.writestr('index.js', work.javascript)

        zip_stream.seek(0)
        return send_file(zip_stream, attachment_filename=f'work_{work.id}.zip', as_attachment=True), 200

    @app.route('/works/<work_id>/<filename>', methods=['GET'])
    def get_file(work_id, filename):
        work = db.session.query(Work).get(work_id)
        if work is None:
            abort(404)

        if filename == 'index.html':
            response = flask.Response(work.html)
            response.content_type = 'text/html'
            return response, 200
        elif filename == 'style.css':
            response = flask.Response(work.css)
            response.content_type = 'text/css'
            return response, 200
        elif filename == 'index.js':
            response = flask.Response(
                f'try{{{work.javascript}}}catch(error){{window.parent.postMessage(error, "http://localhost:3000/")}}')
            response.content_type = 'text/javascript'
            return response, 200
        abort(500)

    @app.after_request
    def apply_caching(res):
        res.headers['Cache-Control'] = 'no-cache'
        return res

    return app
