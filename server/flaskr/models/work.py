from ..db import db
from sqlalchemy import Column, Integer, String

default_html = '''<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <script src="./index.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.3.1/p5.js"></script>
    <link href="./style.css" rel="stylesheet" type="text/css">
</head>
<body>
</body>
</html>
'''

default_css = '''body {
    margin: 0;
    padding: 0;
}
canvas {
    vertical-align: middle;
}
'''

default_javascript = '''function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    background("#29BEEF");
}

function draw() {
    // ここに処理を書きます.
}
'''


class Work(db.Model):
    __tablename__ = 'works'

    id = db.Column(Integer, primary_key=True, autoincrement=True)
    html = db.Column(String, nullable=False, default=default_html)
    css = db.Column(String, nullable=False, default=default_css)
    javascript = db.Column(String, nullable=False, default=default_javascript)
