import { ALIGNMENT, COLOR, Table } from 'console-table-printer';

const red_color: COLOR = 'red';
const green_color: COLOR = 'green';
const left_alignment: ALIGNMENT = 'left';
const center_alignment: ALIGNMENT = 'center';

export const tableCreator = () =>
  new Table({
    columns: [
      {
        name: 'file name',
        alignment: 'left',
      },
      {
        name: 'path',
        alignment: center_alignment,
      },
    ],
  });
