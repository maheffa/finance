package com.manitrarivo.ynab.data.db

import org.hibernate.annotations.CreationTimestamp
import org.springframework.data.jpa.repository.Temporal
import java.time.LocalDateTime
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.TemporalType

@Entity
class Transaction (
    @Temporal(TemporalType.DATE) var date: LocalDateTime,
    var memo: String,
    var amount: Double,
    @ManyToOne @JoinColumn(name = "user_id") var user: User?,
    @ManyToOne @JoinColumn(name = "payee_id") var payee: Payee?
) {
    constructor(): this(LocalDateTime.now(), "<INVALID TRANSACTION>", 0.0, null, null)

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0

    @CreationTimestamp
    val created: LocalDateTime = LocalDateTime.now()
}