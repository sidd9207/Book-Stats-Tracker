from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKeyConstraint, Index
from sqlalchemy.orm import validates

db = SQLAlchemy()

class Author(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    country = db.Column(db.String(100), nullable=True)

    __table_args__ = (
        #Indexes
        Index('author_id_idx', 'id'),
    )

class Genre(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    genre_name = db.Column(db.String(100), nullable=False)

    __table_args__ = (
        #Indexes
        Index('genre_id_idx', 'id'),
    )

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    genre_id = db.Column(db.Integer, db.ForeignKey('genre.id'), nullable=True)
    author_id = db.Column(db.Integer, db.ForeignKey('author.id'), nullable=True)
    price = db.Column(db.Float, nullable=False)
    release_year = db.Column(db.Integer, nullable=True)
    copies_sold = db.Column(db.Integer, default=0)

    __table_args__ = (
        #Foreign Keys
        ForeignKeyConstraint(['genre_id'], ['genre.id'], ondelete='SET NULL'),
        ForeignKeyConstraint(['author_id'], ['author.id'], ondelete='SET NULL'),

        #Indexes
        Index('book_id_idx', 'id'),
        Index('book_price_year_idx', 'price', 'release_year'),
        Index('book_author_idx', 'author_id'),
        Index('book_genre_idx', 'genre_id'),
    )

    genre = db.relationship('Genre', backref=db.backref('books', lazy=True)) #, passive_deletes=True
    author = db.relationship('Author', backref=db.backref('books', lazy=True)) #, passive_deletes=True