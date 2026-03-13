interface PosEmployeesViewProps {
  title?: string;
}

export const PosEmployeesView = ({ title = 'Pos Employees' }: PosEmployeesViewProps) => {
  return <div>{title}</div>;
};
