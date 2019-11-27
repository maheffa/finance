import os
import intrinio_sdk


class Intrinio:
    page_size = 100

    def __init__(self, key='OmY3OTBiYTU5ODc2ZmQ3MmNhYmZhZmVkNTVmMjIxZjc3'):  # sandbox key
        intrinio_sdk.ApiClient().configuration.api_key['api_key'] = os.getenv('INTRINIO_KEY', key)
        self.security_api = intrinio_sdk.SecurityApi()
        self.company_api = intrinio_sdk.CompanyApi()

    def get_stock_prices(self, identifier, start_date, end_date, frequency):
        stock_prices = []
        next_page = ''
        while next_page is not None:
            security = self.security_api.get_security_stock_prices(identifier, start_date=start_date, end_date=end_date,
                                                                   frequency=frequency, page_size=Intrinio.page_size,
                                                                   next_page=next_page)
            stock_prices += security.stock_prices
            next_page = security.next_page

        stock_prices.sort(key=lambda stock_price: stock_price.date)

        return stock_prices

    def get_daily_closing_stock_prices(self, identifier, start_date, end_date):
        return [x.close for x in self.get_stock_prices(identifier, start_date, end_date, 'daily')]

