package com.manitrarivo.ynab.data.db

import org.hibernate.annotations.CreationTimestamp
import java.sql.Date
import java.time.LocalDateTime
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne

@Entity
class CombinedTransaction (
    @Column(nullable = false)
    val date: Date,

    @ManyToOne @JoinColumn
    val payee: CombinedTransactionPayee,

    @ManyToOne @JoinColumn
    val category: CombinedTransactionCategory,

    @ManyToOne @JoinColumn
    val user: User,

    @Column
    val description: String = "",

    @Column(nullable = false)
    val amount: Double
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0

    @CreationTimestamp
    val created: LocalDateTime = LocalDateTime.now()
}
