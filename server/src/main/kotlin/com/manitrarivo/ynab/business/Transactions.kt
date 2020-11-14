package com.manitrarivo.ynab.business

import com.manitrarivo.ynab.data.db.Proportion
import com.manitrarivo.ynab.data.db.Transaction
import com.manitrarivo.ynab.data.db.User
import com.manitrarivo.ynab.data.request.ProportionResponse

/**
 * Given a list of user, proportions and transactions,
 * return how much, on a monthly basis, each user has paid and owe.
 */
fun calculateProportion(users: List<User>, proportions: List<Proportion>, transactions: List<Transaction>): List<List<ProportionResponse>> {
    val totalTransactionPerMonthPerUser = transactions
        .groupBy { it.date.year * 12 + it.date.month.value - 1 }  // grouping by months
        .mapValues { t -> t.value.groupBy { tt -> tt.user }.mapValues { tt -> tt.value.map { ttt -> ttt.amount }.sum() }} // get total by user per month
    val proportionsPerMonth = proportions.groupBy { it.year * 12 + it.month - 1}
    val latestWeight = users.map { it to 1.0 }.toMap().toMutableMap()
    val result = mutableListOf<List<ProportionResponse>>()

    for (monthDate in (totalTransactionPerMonthPerUser.keys + proportionsPerMonth.keys).toList().sorted()) {
        proportionsPerMonth[monthDate]?.forEach { p -> latestWeight[p.user] = p.amount }
        totalTransactionPerMonthPerUser[monthDate]?.let { totalTransactionPerUser ->
            val totalWeight = latestWeight.values.sum()
            val totalSpending = -totalTransactionPerUser.values.sum()
            result += users.map {
                val paid = (totalTransactionPerUser[it] ?: 0.0) * -1
                val proportion = (latestWeight[it] ?: 0.0) / totalWeight
                ProportionResponse(
                    user = it,
                    paid = paid,
                    adjustment = paid - totalSpending * proportion,
                    month = monthDate % 12 + 1,
                    year = monthDate / 12,
                    comp = latestWeight[it] ?: 0.0,
                    totalComp = totalWeight
                )
            }
        }
    }

    return result
}

fun findDuplicates(transactions: List<Transaction>): List<List<Transaction>> {
    return transactions
        .groupBy { it.hashCode() }
        .values
        .filter { it.size > 1 }
}