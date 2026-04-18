import { useEffect, useRef } from "react";

type ReportFn = (value: number) => void;

export function useCounter(report: ReportFn) {
  const countRef = useRef(0);

  useEffect(() => {
    const currentCount = countRef.current;
    report(currentCount);
  }, [report]);

  return countRef;
}
