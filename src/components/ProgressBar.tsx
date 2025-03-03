import { classNames } from "@utils";
import { FC } from "react";

type ProgressBarProps = {
  value: number;
  className?: string;
};

export const ProgressBar: FC<ProgressBarProps> = ({ value, className = "" }) => {
  return (
    <div className={classNames('w-full h-4 rounded-full overflow-hidden bg-muted', className)}>
      <div
        className="h-full bg-accent transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};
