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
import flask_migrate

from .models.work import Work
from .models.file import File
from .db import db, init_db


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        JSON_AS_ASCII=False
    )
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/flaskr.sqlite'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

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
                'javascript': work.javascript,
                'files': list(map(lambda f: {'name': f.file_name, 'body': f.body}, work.files))
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

    @app.route('/work/<work_id>/<filename>/<type>', methods=['POST'])
    def new_file(work_id, filename, type):
        work = db.session.query(Work).get(work_id)
        if work is None:
            abort(404)
        if type == 'css':
            ext = '.css'
            c_type = 'text/css'
        elif type == 'javascript':
            ext = '.js'
            c_type = 'text/javascript'
        else:
            abort(400)

        filenames = list(map(lambda f: f.file_name, work.files))
        if (filename + ext) not in filenames:
            work.files.append(
                File(file_name=filename+ext, content_type=c_type))
        else:
            # ファイル名が衝突する場合
            # 衝突しなくなるまで(i)を探索する
            i = 1
            while True:
                tmp_f_name = (filename + f'({i})' + ext)
                if tmp_f_name not in filenames:
                    work.files.append(
                        File(file_name=tmp_f_name, content_type=c_type))
                    break
                i += 1

        db.session.commit()
        return {}, 200

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
            for file in work.files:
                zip_temp.writestr(file.file_name, file.body)

        zip_stream.seek(0)
        return send_file(zip_stream, attachment_filename=f'work_{work.id}.zip', as_attachment=True), 200

    @app.route('/work/<work_id>/<filename>', methods=['GET'])
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
        else:
            # work.filesから名前が一致するものを探す
            for file in work.files:
                if (file.file_name == filename):
                    response = flask.Response(file.body)
                    response.content_type = file.content_type
                    return response, 200
            abort(404)

    @app.after_request
    def apply_caching(res):
        res.headers['Cache-Control'] = 'no-cache'
        return res

    return app
