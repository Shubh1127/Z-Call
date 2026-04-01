import pandas as pd
import numpy as np

# Step 1: Create a messy dataset
data = {
    'Name': ['Mansi', 'Riya', 'Rahul', 'Aman', 'Riya', 'Neha'],
    'Age': [27, np.nan, 30, 29, np.nan, 'twenty six'],
    'Salary': [4500, 45000, np.nan, 52000, 45000, 47000],
    'Department': ['HR', 'hr', 'IT', 'IT', 'hr', 'Finance'],
    'Join_Date': ['2022-01-10', '2021-07-15', '2020-03-22', '2020-03-22', '2021-07-15', '2021/08/10']
}
df = pd.DataFrame(data)

# Step 2: Check dataset information
print("Initial Dataset:")
print(df)

print("\nDataset Info:")
print(df.info())

print("\nStatistical Summary:")
print(df.describe(include='all'))
