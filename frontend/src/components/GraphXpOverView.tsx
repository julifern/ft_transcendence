"use clients";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { XpHistory } from "../types/XpHistory";

export function GraphXpOverView({ xpHistory, week }: { xpHistory: XpHistory[][], week: number }) {
  let xpHistoryDisplay;
  if (week <= 3)
    xpHistoryDisplay = xpHistory[week];
  else
    xpHistoryDisplay = xpHistory.flat();
  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart responsive data={xpHistoryDisplay}>
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
