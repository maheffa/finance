package com.manitrarivo.ynab.business

import com.manitrarivo.ynab.data.db.Payee
import com.manitrarivo.ynab.data.db.Transaction
import com.manitrarivo.ynab.data.db.User
import org.junit.Test
import java.time.LocalDateTime
import org.junit.Assert.assertEquals

class TransactionsDuplicateTest {
    @Test
    fun findDuplicate() {
        val u1 = User(1, "a")
        val u2 = User(2, "b")
        val d1 = LocalDateTime.of(2000, 1, 1, 0, 0)
        val d2 = LocalDateTime.of(2000, 1, 2, 0, 0)
        val p1 = Payee(1, "x")
        val p2 = Payee(2, "y")
        val t1 = Transaction(1, d1, "abc", 1.0, u1, p1)
        val t2 = Transaction(2, d2, "abx", 1.0, u2, p2)
        val t3 = Transaction(3, d1, "abx", 1.0, u2, p1)
        val t4 = Transaction(4, d2, "abx", 1.0, u2, p2)
        val t5 = Transaction(5, d1, "abc", 1.0, u1, p1)

        val res = findDuplicates(listOf(t1, t2, t3, t4, t5))
        assertEquals(
            res.map { group -> group.map { it.id } },
            listOf(listOf(1, 5), listOf(2, 4))
        )
    }
}