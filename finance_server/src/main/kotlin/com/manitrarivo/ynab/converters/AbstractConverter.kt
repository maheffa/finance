package com.manitrarivo.ynab.converters



/*
import os
import csv


class Converter(object):
    YNAB_DATE_FORMAT = '%d/%m/%Y'  # 22/04/2018
    TARGET_COL_DATE = 'Date'
    TARGET_COL_PAYEE = 'Payee'
    TARGET_COL_MEMO = 'Memo'
    TARGET_COL_OUTFLOW = 'Outflow'
    TARGET_COL_INFLOW = 'Inflow'
    TARGET_COLS = [TARGET_COL_DATE, TARGET_COL_PAYEE, TARGET_COL_MEMO, TARGET_COL_OUTFLOW, TARGET_COL_INFLOW]

    def get_file_reader(self, filename, **kwargs):
        raise NotImplementedError()

    def get_date(self, transaction):
        raise NotImplementedError()

    def get_payee(self, transaction):
        raise NotImplementedError()

    def get_inflow(self, transaction):
        raise NotImplementedError()

    def get_outflow(self, transaction):
        raise NotImplementedError()

    def get_memo(self, transaction):
        return ''

    def convert_filename(self, orig, save_to=None):
        base_name = os.path.basename(orig)
        dir_name = os.path.dirname(orig)
        new_base_name = '.'.join(base_name.split('.')[:-1] + ['csv'])
        return os.path.join(save_to if save_to else dir_name, new_base_name)

    def convert(self, filename, save_to=None, **kwargs):
        reader = self.get_file_reader(filename, **kwargs)
        outfile_name = self.convert_filename(filename, save_to=save_to)

        with open(outfile_name, 'w') as csv_file:
            csv_writer = csv.DictWriter(csv_file, Converter.TARGET_COLS, delimiter=',')
            csv_writer.writeheader()

            while reader.has_next_transaction():
                transaction = reader.get_next_transaction()
                csv_writer.writerow({
                    Converter.TARGET_COL_DATE: self.get_date(transaction),
                    Converter.TARGET_COL_PAYEE: self.get_payee(transaction),
                    Converter.TARGET_COL_MEMO: self.get_memo(transaction),
                    Converter.TARGET_COL_INFLOW: self.get_inflow(transaction),
                    Converter.TARGET_COL_OUTFLOW: self.get_outflow(transaction),
                })

        return outfile_name


class FileReader(object):
    def __init__(self, cur_row, max_row):
        self.max_row = max_row
        self.cur_row = cur_row

    def _get_row_by_index(self, index):
        raise NotImplementedError()

    def has_next_transaction(self):
        return self.cur_row < self.max_row

    def get_next_transaction(self):
        cur_row = self.cur_row
        self.cur_row += 1
        return self._get_row_by_index(cur_row)




 */