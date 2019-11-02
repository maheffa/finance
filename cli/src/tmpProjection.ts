
const spMonthly = [
  // tslint:disable-next-line
  0.0187, -0.0158, 0.0144, 0.0705, -0.0635, 0.0405, 0.0194, 0.0321, 0.0801, -0.09029999999999999, 0.0204, -0.0684, 0.005699999999999999, 0.0326, 0.037200000000000004, 0.0062, 0.0241, 0.0038, -0.0254, -0.0369, 0.057300000000000004, 0.0111, 0.030699999999999998, 0.0233, 0.0206,
  // tslint:disable-next-line
  0.0031, 0.0206, 0.0062, 0.0141, 0.0103, 0.0012, 0.0397, 0.019, 0.019799999999999998, 0.037000000000000005, -0.0182, 0.0002, 0.0014000000000000002, 0.0369, 0.0026, 0.018000000000000002, 0.0039000000000000003, 0.0678, -0.0014000000000000002, -0.0496, -0.0158, 0.003, 0.08439999999999999, -0.024700000000000003, -0.0603,
];
const getMean = (data: number[]) => data.reduce((a, b) => a + b) / data.length;
const getSD = (data: number[]) => {
  const m = getMean(data);
  return Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / (data.length - 1));
};
const normalRandom = (avg0: number, sd0: number) => {
  let u = 0;
  let v = 0;
  while (u === 0) { u = Math.random(); }
  while (v === 0) { v = Math.random(); }

  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * sd0 + avg0;
};

// console.log('S&P Average monthly = ' + getMean(spMonthly));
// console.log('S&P SD times 3 = ' + getSD(spMonthly));
// const normalData = (new Array(5000)).fill(0).map(() => normalRandom(5, 2));
// console.log('Avg is => ' + getMean(normalData));
// console.log('SD is => ' + getSD(normalData));

interface IMonthData {
  portfolio: number;
  invested: number;
  interestRate: number;
  interest: number;
  accumulatedInterest: number;
  accumulatedInvestment: number;
}

export class ProjectionCalculator {
  // private minInterest = -0.01;
  // private maxInterest = 0.03;
  protected monthlyInvestment = 1000;
  protected nMonth = 12 * 10;
  protected portfolio: number[];
  protected invested: number[];
  protected interestRates: number[];
  protected interest: number[];
  protected accumulatedInterests: number[];
  protected accumulatedInvestment: number[];

  constructor(interestRateBaskets: number[]) {
    const basketSize = interestRateBaskets.length;
    this.interestRates = (new Array(this.nMonth))
      .fill(0)
      .map(() => interestRateBaskets[Math.floor(Math.random() * basketSize)]);
    this.invested = (new Array(this.nMonth)).fill(this.monthlyInvestment);
    this.portfolio = (new Array(this.nMonth)).fill(0);
    this.interest = (new Array(this.nMonth)).fill(0);
    this.accumulatedInvestment = (new Array(this.nMonth)).fill(0);
    this.accumulatedInterests = (new Array(this.nMonth)).fill(0);
    this.projectPortfolio();
  }

  public getDataAt(nMonth: number): IMonthData {
    return {
      portfolio: this.portfolio[nMonth],
      invested: this.invested[nMonth],
      interestRate: this.interestRates[nMonth],
      interest: this.interest[nMonth],
      accumulatedInterest: this.accumulatedInterests[nMonth],
      accumulatedInvestment: this.accumulatedInvestment[nMonth],
    };
  }

  public getPrintableData(startMonth: number, endMonth: number) {
    const separator = ';';
    let result = [
      'nMonth', 'portfolio', 'invested', 'interestRate', 'interest',
      'accumulated interest', 'accumulated investment',
    ].join(separator) + '\n';
    for (let i = Math.max(startMonth, 0); i < Math.min(this.nMonth, endMonth); i++) {
      const data = this.getDataAt(i);
      result += [
        i, data.portfolio.toFixed(2), data.invested.toFixed(2),
        data.interestRate.toFixed(5), data.interest.toFixed(2),
        data.accumulatedInterest.toFixed(2), data.accumulatedInvestment.toFixed(2),
      ].join(separator) + '\n';
    }
    return result;
  }

  protected projectPortfolio() {
    this.portfolio[0] = this.invested[0];
    this.interest[0] = 0;
    this.accumulatedInterests[0] = 0;
    this.accumulatedInvestment[0] = this.invested[0];
    for (let i = 1; i < this.nMonth; i++) {
      this.interest[i] = this.portfolio[i - 1] * this.interestRates[i - 1];
      this.portfolio[i] = this.portfolio[i - 1] + this.interest[i] + this.invested[i];
      this.accumulatedInterests[i] = this.accumulatedInterests[i - 1] + this.interest[i];
      this.accumulatedInvestment[i] = this.accumulatedInvestment[i - 1] + this.invested[i];
    }
    return this.portfolio;
  }
}

class AggregationCalculator extends ProjectionCalculator {
  constructor(interestRateBaskets: number[], n: number) {
    super(interestRateBaskets);
    const others = n - 1;
    for (let iAgg = 0; iAgg < others; iAgg++) {
      const projection = new ProjectionCalculator(interestRateBaskets);
      for (let iMonth = 0; iMonth < this.nMonth; iMonth++) {
        this.addDataAt(iMonth, projection.getDataAt(iMonth));
      }
    }
    for (let iMonth = 0; iMonth < this.nMonth; iMonth++) {
      this.normalizeDataAt(iMonth, n);
    }
  }

  public addDataAt(nMonth: number, data: IMonthData) {
    this.portfolio[nMonth] += data.portfolio;
    this.invested[nMonth] += data.invested;
    this.interestRates[nMonth] += data.interestRate;
    this.interest[nMonth] += data.interest;
    this.accumulatedInterests[nMonth] += data.accumulatedInterest;
    this.accumulatedInvestment[nMonth] += data.accumulatedInvestment;
  }

  public normalizeDataAt(nMonth: number, n: number) {
    this.portfolio[nMonth] /= n;
    this.invested[nMonth] /= n;
    this.interestRates[nMonth] /= n;
    this.interest[nMonth] /= n;
    this.accumulatedInterests[nMonth] /= n;
    this.accumulatedInvestment[nMonth] /= n;
  }
}
