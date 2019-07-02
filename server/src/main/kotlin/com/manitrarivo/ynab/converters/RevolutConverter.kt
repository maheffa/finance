package com.manitrarivo.ynab.converters


/*
from datetime import datetime
import pandas as pd
from converters.base import FileReader, Converter


class RevolutFileReader(FileReader):
    def __init__(self, filename):
        cols = [RevolutConverter.COL_DATE,
                RevolutConverter.COL_DESCRIPTION,
                RevolutConverter.COL_OUTFLOW,
                RevolutConverter.COL_INFLOW,
                'eout', 'ein', 'bal', 'note']
        self.data = pd.read_csv(filename, delimiter=';', names=cols, index_col=False)
        self.data = self.filter_out_vaults(self.data)
        FileReader.__init__(self, 1, len(self.data))

    def filter_out_vaults(self, data):
        vault_data = data[data[RevolutConverter.COL_DESCRIPTION].str.contains('Invisoble Saving')]
        d_out = vault_data[RevolutConverter.COL_OUTFLOW].apply(lambda x: float(x.strip() or 0))
        d_in = vault_data[RevolutConverter.COL_INFLOW].apply(lambda x: float(x.strip() or 0))
        total = int((d_in - d_out).sum())
        new_data = data[~data[RevolutConverter.COL_DESCRIPTION].str.contains('Invisoble Saving')]
        new_data = new_data.append({
            RevolutConverter.COL_DATE: data.iloc[-1][RevolutConverter.COL_DATE],
            RevolutConverter.COL_DESCRIPTION: 'Vault',
            RevolutConverter.COL_OUTFLOW: str(-total) if total <= 0 else '0',
            RevolutConverter.COL_INFLOW: str(total) if total > 0 else '0',
            'eout': '', 'ein': '', 'bal': '', 'note': '',
        }, ignore_index=True)
        return new_data

    def _get_row_by_index(self, index):
        return self.data.iloc[index]


class RevolutConverter(Converter):
    COL_DATE = 'date'
    COL_DESCRIPTION = 'desc'
    COL_INFLOW = 'inflow'
    COL_OUTFLOW = 'outflow'
    DATE_FMT = '%b %d, %Y'

    def get_file_reader(self, filename, **kwargs):
        return RevolutFileReader(filename)

    def get_date(self, transaction):
        return datetime.strptime(str(transaction[RevolutConverter.COL_DATE].strip()), RevolutConverter.DATE_FMT).strftime(Converter.YNAB_DATE_FORMAT)

    def get_payee(self, transaction):
        val = transaction[RevolutConverter.COL_DESCRIPTION].strip()

        if val.startswith('Uber'):
            return 'Uber'

        if val.startswith('Google'):
            return 'Google'

        if val.find('Booking.com') >= 0:
            return 'Booking.com'

        if val.find('Linode') >= 0:
            return 'Linode'

        if val == 'Payment from Am Manitrarivo':
            return 'from Daily checking'

        if val.startswith('Amzn') or (val.find('Amazon') >= 0):
            return 'Amazon'

        if val.startswith('Audible'):
            return 'Audible'

        if val.startswith('Top-Up by'):
            return 'from ICS'

        return ''

    def get_memo(self, transaction):
        desc = transaction[RevolutConverter.COL_DESCRIPTION].strip()

        if desc.startswith('Top-Up by'):
            return 'Top Up'

        return desc if not self.get_payee(transaction) else ''

    def get_outflow(self, transaction):
        val = transaction[RevolutConverter.COL_OUTFLOW].strip()
        return round(float(val)) if val else None

    def get_inflow(self, transaction):
        val = transaction[RevolutConverter.COL_INFLOW].strip()
        return round(float(val)) if val else None


 */