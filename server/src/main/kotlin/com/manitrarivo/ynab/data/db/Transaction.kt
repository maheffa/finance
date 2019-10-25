package com.manitrarivo.ynab.data.db

import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne

@Entity
class Transaction (
    val date: LocalDateTime,
    val memo: String,
    val amount: Double,
    @ManyToOne @JoinColumn(name = "user_id") val user: User,
    @ManyToOne @JoinColumn(name = "payee_id") val payee: Payee
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0

    @CreationTimestamp
    val created: LocalDateTime = LocalDateTime.now()
}