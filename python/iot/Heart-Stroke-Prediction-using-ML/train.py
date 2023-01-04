from tkinter import *
import pandas as pd
from sklearn.model_selection import train_test_split
import pickle
from sklearn.ensemble import RandomForestClassifier
df = pd.read_csv('C:\\Users\\nghia\\Downloads\\Nhom2_Theo-doi-nhip-tim-firebase-website\\python\\iot\\Heart-Stroke-Prediction-using-ML\\heart2.csv')

predictors = df.drop(['target'], axis=1)
target = df["target"]
print(df)

x_train, x_val, y_train, y_val = train_test_split(
    predictors, target, test_size=0.22, random_state=0)
randomforest = RandomForestClassifier()
randomforest.fit(x_train, y_train)
y_pred = randomforest.predict(x_val)

filename = 'C:\\Users\\nghia\\Downloads\\Nhom2_Theo-doi-nhip-tim-firebase-website\\python\\iot\\Heart-Stroke-Prediction-using-ML\\model.sav'
pickle.dump(randomforest, open(filename, 'wb'))
