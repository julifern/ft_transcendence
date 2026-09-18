"use clients";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const productSales = [
  {
    name: "lundi",
    studentXp: 10,
    AverageXp: 20
  },
  {
    name: "mardi",
    studentXp: 1,
    xpMoyenne: 10
  },
  {
    name: "mercredi",
    studentXp: 20,
    xpMoyenne: 50
  },
    {
    name: "jeudi",
    studentXp: 40,
    xpMoyenne: 30
  },
  {
    name: "vendredi",
    studentXp: 30,
    xpMoyenne: 5
  },
  {
    name: "samedi",
    studentXp: 20,
    xpMoyenne: 10
  },
  {
    name: "dimanche",
    studentXp: 10,
    xpMoyenne: 10
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
