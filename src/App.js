import React from 'react';
import HierarchicalTable from './Components/HierarchicalTable';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const data = {
  "rows": [
    {
      "id": "electronics",
      "label": "Electronics",
      "value": 1500,
      "children": [
        {
          "id": "phones",
          "label": "Phones",
          "value": 800
        },
        {
          "id": "laptops",
          "label": "Laptops",
          "value": 700
        }
      ]
    },
    {
      "id": "furniture",
      "label": "Furniture",
      "value": 1000,
      "children": [
        {
          "id": "tables",
          "label": "Tables",
          "value": 300
        },
        {
          "id": "chairs",
          "label": "Chairs",
          "value": 700
        }
      ]
    }
  ]
};

function App() {
  return (
    <div className="App">
      <HierarchicalTable data={data} />
    </div>
  );
}

export default App;