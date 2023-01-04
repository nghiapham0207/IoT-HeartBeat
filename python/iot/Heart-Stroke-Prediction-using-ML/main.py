# from crypt import methods
from flask import Flask, render_template, request, json, jsonify, redirect, url_for
from flask_cors import CORS

import os
import datetime
import predict

app = Flask(__name__)
CORS(app)


@app.route("/", methods=['GET', 'POST'])
def home():
    if request.method == 'GET':
        predict.prediction_model(61, 1, 0, 138, 166, 125)
        return render_template("index.html")
    if request.method == 'POST':
        dict = request.values.to_dict()
        gioitinh = dict['gioitinh']
        tuoi = dict['tuoi']
        oxy = dict['oxy']
        huyetap = dict['huyetap']
        daunguc = dict['daunguc']
        nhiptim = dict['nhiptim']
        print(gioitinh, ' ', tuoi, ' ', oxy, ' ',
              huyetap, ' ', daunguc, ' ', nhiptim)
        print(predict.prediction_model(
            tuoi, gioitinh, daunguc, huyetap, oxy, nhiptim))
        # thay chol bang oxy trong mau
        return predict.prediction_model(tuoi, gioitinh, daunguc, huyetap, oxy, nhiptim)


if __name__ == "__main__":
    app.run(debug=True)
