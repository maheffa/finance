package com.manitrarivo.ynab.data.db

import org.apache.commons.lang3.builder.HashCodeBuilder
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
    @ManyToOne @JoinColumn(name = "user_id") var user: User,
    @ManyToOne @JoinColumn(name = "payee_id") var payee: Payee?
) {
    constructor(): this(LocalDateTime.now(), "<INVALID TRANSACTION>", 0.0, User(), null)
    constructor(id: Int, date: LocalDateTime, memo: String, amount: Double, user: User, payee: Payee): this(date, memo, amount, user, payee) {
        this.id = id
    }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int = 0

    @CreationTimestamp
    val created: LocalDateTime = LocalDateTime.now()

    override fun equals(other: Any?): Boolean {
        return other is Transaction
            && this.date == other.date
            && this.memo == other.memo
            && this.amount == other.amount
            && this.user.id == other.user.id
            && this.payee?.id == other.payee?.id
    }

    override fun hashCode() = HashCodeBuilder()
        .append(date.hashCode())
        .append(memo.hashCode())
        .append(amount.hashCode())
        .append(user.id.hashCode())
        .append(payee?.id?.hashCode())
        .toHashCode()
}