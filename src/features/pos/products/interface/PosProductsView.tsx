interface PosProductsViewProps {
  title?: string;
}

export const PosProductsView = ({ title = 'Pos Products' }: PosProductsViewProps) => {
  return <div>{title}</div>;
};
