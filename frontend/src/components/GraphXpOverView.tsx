"use clients";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { XpHistory } from "../types/XpHistory";

export function GraphXpOverView({ xpHistory }: { xpHistory: XpHistory[] }) {
  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart responsive data={xpHistory}>
          <YAxis />
          <XAxis dataKey={"day"}/>
          <CartesianGrid />

          <Tooltip />
          <Legend />

          <Bar dataKey={"xp"} type={"monotone"} fill={"var(--purple)"} stroke="var(--purple)" stackId={"1"}/>
          <Bar dataKey={"average"} type={"monotone"} fill={"var(--bright-purple)"} stroke="var(--bright-purple)" stackId={"2"}/>
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
