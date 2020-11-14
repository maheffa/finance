package com.manitrarivo.ynab.business

import com.manitrarivo.ynab.data.db.Proportion
import com.manitrarivo.ynab.data.db.Transaction
import com.manitrarivo.ynab.data.db.User
import com.manitrarivo.ynab.data.request.ProportionResponse
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import java.time.LocalDateTime

class TransactionsProportionTest {
    lateinit var user1: User
    lateinit var user2: User

    @Before
    fun setUp() {
        user1 = User(1, "u1")
        user2 = User(2, "u2")
    }

    @Test
    fun emptyScenarios() {
        assertEquals(
            calculateProportion(listOf(), listOf(), listOf()),
            listOf<Map<Int, ProportionResponse>>()
        )
        println(user1.id)
        println(user2.id)
    }

    @Test
    fun normalCase() {
        val result = calculateProportion(
            listOf(user1, user2),
            listOf(
                Proportion(user1, 1, 2020, 500.0),
                Proportion(user2, 1, 2020, 500.0),
                Proportion(user1, 3, 2020, 1000.0),
                Proportion(user2, 5, 2020, 1500.0)
            ),
            listOf(
                Transaction(LocalDateTime.of(2020, 1, 1, 0, 0), "1", -100.0, user1, null),
                Transaction(LocalDateTime.of(2020, 1, 15, 0, 0), "2", -100.0, user1, null),
                Transaction(LocalDateTime.of(2020, 1, 20, 0, 0), "2", -100.0, user2, null),
                //month1, 300 total spent. split 50/50. user1 spent 200, user2 100. user2 owes 50 to user1

                Transaction(LocalDateTime.of(2020, 2, 1, 0, 0), "1", -100.0, user2, null),
                Transaction(LocalDateTime.of(2020, 2, 15, 0, 0), "2", -100.0, user2, null),
                Transaction(LocalDateTime.of(2020, 2, 20, 0, 0), "2", -100.0, user1, null),
                //month2, 300 total spent. split 50/50. user1 spent 100, user2 200. user1 owes 50 from user2

                Transaction(LocalDateTime.of(2020, 3, 1, 0, 0), "1", -100.0, user2, null),
                Transaction(LocalDateTime.of(2020, 3, 15, 0, 0), "2", -50.0, user2, null),
                Transaction(LocalDateTime.of(2020, 3, 20, 0, 0), "2", -50.0, user1, null),
                Transaction(LocalDateTime.of(2020, 3, 20, 0, 0), "2", -100.0, user1, null),
                // month3, 300 total spent. split user1: 2/3| user2: 1/3. user1 and user2 spent 150. user1 should pay 200, user2: 100. User1 owes 50 to user2

                Transaction(LocalDateTime.of(2020, 4,1, 0, 0), "1", -100.0, user2, null),
                Transaction(LocalDateTime.of(2020, 4,20, 0, 0), "2", -100.0, user1, null),
                Transaction(LocalDateTime.of(2020, 4,20, 0, 0), "2", -100.0, user1, null),
                // month4, 300 total spent. split user1: 2/3| user2: 1/3. user1: 200, user2: 100. no repayment

                Transaction(LocalDateTime.of(2020, 5,1, 0, 0), "1", -500.0, user2, null)
                // month5, 500 total. split user1: 2/5| user2: 3/5. user2 spent 500. user1 owes 200 to user2
            )
        )
        val expected = listOf(
            //month1, 300 total spent. split 50/50. user1 spent 200, user2 100. user2 owes 50 to user1
            listOf(
                ProportionResponse(user1, paid = 200.0, adjustment = 50.0, month = 1, year = 2020, comp = 500.0, totalComp = 1000.0),
                ProportionResponse(user2, paid = 100.0, adjustment = -50.0, month = 1, year = 2020, comp = 500.0, totalComp = 1000.0)
            ),
            //month2, 300 total. split 50/50. user1 spent 100, user2 200. user1 owes 50 from user2
            listOf(
                ProportionResponse(user1, paid = 100.0, adjustment = -50.0, month = 2, year = 2020, comp = 500.0, totalComp = 1000.0),
                ProportionResponse(user2, paid = 200.0, adjustment = 50.0, month = 2, year = 2020, comp = 500.0, totalComp = 1000.0)
            ),
            // month3, 300 total. split user1: 2/3| user2: 1/3. user1 and user2 spent 150. user1 should pay 200, user2: 100. User1 owes 50 to user2
            listOf(
                ProportionResponse(user1, paid = 150.0, adjustment = -50.0, month = 3, year = 2020, comp = 1000.0, totalComp = 1500.0),
                ProportionResponse(user2, paid = 150.0, adjustment = 50.0, month = 3, year = 2020, comp = 500.0, totalComp = 1500.0)
            ),
            // month4, 300 total. split user1: 2/3| user2: 1/3. user1: 200, user2: 100. no repayment
            listOf(
                ProportionResponse(user1, paid = 200.0, adjustment = 0.0, month = 4, year = 2020, comp = 1000.0, totalComp = 1500.0),
                ProportionResponse(user2, paid = 100.0, adjustment = 0.0, month = 4, year = 2020, comp = 500.0, totalComp = 1500.0)
            ),
            // month5, 500 total, spit user1: 2/5| user2: 3/5. user2 spent 500. user1 owes 200 to user2
            listOf(
                ProportionResponse(user1, paid = -0.0, adjustment = -200.0, month = 5, year = 2020, comp = 1000.0, totalComp = 2500.0),
                ProportionResponse(user2, paid = 500.0, adjustment = 200.0, month = 5, year = 2020, comp = 1500.0, totalComp = 2500.0)
            )
        )
        for (i in result.indices) {
            assertEquals(expected[i], result[i])
        }
    }

    @Test
    fun changesDuringEmptyMonth() {
        val result = calculateProportion(
            listOf(user1, user2),
            listOf(
                Proportion(user1, 1, 2020, 1000.0),
                Proportion(user2, 1, 2020, 500.0),
                Proportion(user1, 3, 2020, 1000.0),
                Proportion(user2, 3, 2020, 1500.0)
            ),
            listOf(
                Transaction(LocalDateTime.of(2020, 2, 1, 0, 0), "1", -100.0, user2, null),
                Transaction(LocalDateTime.of(2020, 2, 15, 0, 0), "2", -100.0, user2, null),
                Transaction(LocalDateTime.of(2020, 2, 20, 0, 0), "2", -100.0, user1, null),
                //month2, 300 total spent. split 2/3|1/3. user1 spent 100, user2 200. user1 owes 100 to user2

                Transaction(LocalDateTime.of(2020, 5,1, 0, 0), "1", -500.0, user2, null)
                // month5, 500 total. split user1: 2/5| user2: 3/5. user2 spent 500. user1 owes 200 to user2
            )
        )
        val expected = listOf(
            listOf(
                ProportionResponse(user1, paid = 100.0, adjustment = -100.0, month = 2, year = 2020, comp = 1000.0, totalComp = 1500.0),
                ProportionResponse(user2, paid = 200.0, adjustment = 100.0, month = 2, year = 2020, comp = 500.0, totalComp = 1500.0)
            ),
            listOf(
                ProportionResponse(user1, paid = -0.0, adjustment = -200.0, month = 5, year = 2020, comp = 1000.0, totalComp = 2500.0),
                ProportionResponse(user2, paid = 500.0, adjustment = 200.0, month = 5, year = 2020, comp = 1500.0, totalComp = 2500.0)
            )
        )
        for (i in result.indices) {
            assertEquals(expected[i], result[i])
        }
    }
}