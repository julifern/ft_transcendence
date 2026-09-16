"use clients";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const productSales = [
  {
    name: "lundi",
    product1: 10,
    product2: 20
  },
    {
    name: "mardi",
    product1: 1,
    product2: 10
  },
    {
    name: "mercredi",
    product1: 20,
    product2: 50
  },
    {
    name: "jeudi",
    product1: 40,
    product2: 30
  },
    {
    name: "vendredi",
    product1: 30,
    product2: 5
  },
    {
    name: "samedi",
    product1: 20,
    product2: 10
  },
  {
    name: "dimanche",
    product1: 10,
    product2: 10
  },
]

export function GraphXpOverView() {
  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart responsive data={productSales}>
          <YAxis />
          <XAxis dataKey={"name"}/>
          <CartesianGrid />

          <Tooltip />
          <Legend />

          <Bar dataKey={"product1"} type={"monotone"} fill={"var(--purple)"} stroke="var(--purple)" stackId={"1"}/>
          <Bar dataKey={"product2"} type={"monotone"} fill={"var(--bright-purple)"} stroke="var(--bright-purple)" stackId={"2"}/>
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
