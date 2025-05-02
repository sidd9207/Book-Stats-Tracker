from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event, text
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS
from models import db, Author, Genre, Book  # Import database and models

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = SQLALCHEMY_TRACK_MODIFICATIONS
cord = CORS(app, origins='*')

db.init_app(app)


with app.app_context():
    # Create tables
    db.create_all()

    # Enable foreign keys globally when a SQLite connection is created
    @event.listens_for(db.engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.execute("PRAGMA locking_mode=IMMEDIATE;")
        cursor.close()    

    @event.listens_for(db.engine, "connect")
    def set_sqlite_isolation_level(dbapi_connection, connection_record):
        # dbapi_connection.isolation_level = "EXCLUSIVE" 
        dbapi_connection.isolation_level = "IMMEDIATE"

@app.route("/", methods=['GET'])
def home():
    return "Hello World!"


#START OF GENRES ENDPOINTS

@app.route("/add_genre", methods=['POST'])
def add_genre():
    data = request.get_json()
    genre_name = data.get('genre_name')

    if (genre_name):
        try:
            with db.session.begin():
                genre = Genre(genre_name=genre_name)
                db.session.add(genre)
                db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
        return jsonify({"message": "Genre added Successfully!"}), 200
    else:
        return jsonify({"error": "Genre name is Required!"}), 400

@app.route("/get_genres", methods=['GET'])
def get_genres():
    genres = Genre.query.all()
    genres_list = [{"id": genre.id, "genre_name": genre.genre_name} for genre in genres]
    return jsonify(genres_list), 200

@app.route("/delete_genre/<int:id>", methods=['DELETE'])
def delete_genre(id):
    genre = Genre.query.get(id)
    if genre:
        db.session.delete(genre)
        db.session.commit()
        return jsonify({"message": "Genre deleted successfully!"}), 200
    return jsonify({"error": "Genre not found!"}), 404


#START OF AUTHORS ENDPOINTS

@app.route("/add_author", methods=['POST'])
def add_author():
    data = request.get_json()
    first = data.get('first')
    last = data.get('last')
    age = data.get('age')
    country = data.get('country') if data.get('country').strip() else None

    if first and last and age:
        try:
            with db.session.begin():
                author = Author(first_name=first, last_name=last, age=age, country=country)
                db.session.add(author)
                db.session.commit()          
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
        return jsonify({"message": "Author added Successfully!"}), 200
    else:
        return jsonify({"error": "Author first name, last name, and age are Required!"}), 400
    
@app.route("/get_authors", methods=['GET'])
def get_authors():
    authors = Author.query.all()
    authors_list = [{'id': author.id, 'first': author.first_name, 'last': author.last_name, 'age': author.age, 'country': author.country} for author in authors]
    return jsonify(authors_list), 200

@app.route("/delete_author/<int:id>", methods=['DELETE'])
def delete_author(id):
    author = Author.query.get(id)
    if author:
        try:
            db.session.delete(author)
            db.session.commit()
            return jsonify({"message": "Author deleted successfully!"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Author not found!"}), 404

@app.route("/update_author/<int:id>", methods=['PUT'])
def update_author(id):
    data = request.get_json()
    newFirst = data.get('first')
    newLast = data.get('last')
    newAge = data.get('age')
    newCountry = data.get('country') if data.get('country').strip() else None

    author = Author.query.get(id)

    if author:
        if newFirst and newLast and newAge:
            author.first_name = newFirst
            author.last_name = newLast
            author.age = newAge
            author.country = newCountry

            try:
                db.session.commit()
                return jsonify({"message": "Author updated successfully!"}), 200
            except Exception as e:
                db.session.rollback()
                return jsonify({"error": str(e)}), 500
        else:
            return jsonify({"error": "Author first name, last name, and age are Required!"}), 400
    else:
        return jsonify({"error": "Author not found!"}), 404
    

#START BOOKS ENDPOINTS

@app.route("/add_book", methods=['POST'])
def add_book():
    data = request.get_json()
    name = data.get('name')
    genre = data.get('genre')
    author = data.get('author')
    price = data.get('price')
    release_year = data.get('releaseYear')
    copies_sold = data.get('copiesSold')

    if name and price :
        try:
            with db.session.begin():
                book = Book(name=name, genre_id=genre, author_id=author, price=price, release_year=release_year, copies_sold=copies_sold)
                db.session.add(book)
                db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
        return jsonify({"message": "Book added Successfully!"}), 200
    else:
        return jsonify({"error": "Book name and price are Required!"}), 400
    
@app.route("/get_books", methods=['GET'])
def get_books():
    books = (
        db.session.query(
            Book.id,
            Book.name,
            Book.genre_id,
            Genre.genre_name.label("genre"),
            Book.author_id,
            Author.first_name.label("first_name"),
            Author.last_name.label("last_name"),
            Book.price,
            Book.release_year,
            Book.copies_sold
        )
        .join(Genre, Book.genre_id == Genre.id)  # Join with Genre table
        .join(Author, Book.author_id == Author.id)  # Join with Author table
        .all()
    )
    books_list = [{'id': book.id, 'name': book.name, 'genre_id': book.genre_id, 'genre': book.genre, 'author_id': book.author_id, 'author': f"{book.first_name} {book.last_name}", 'price': book.price, 'year': book.release_year, 'copies': book.copies_sold} for book in books]

    return jsonify(books_list), 200

@app.route("/delete_book/<int:id>", methods=['DELETE'])
def delete_book(id):
    book = Book.query.get(id)

    if book:
        try:
            db.session.delete(book)
            db.session.commit()
            return jsonify({"message": "Book deleted successfully!"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Book not found!"}), 404

@app.route("/update_book/<int:id>", methods=['PUT'])
def update_book(id):
    data = request.get_json()
    newName = data.get('name')
    newGenre = data.get('genre')
    newAuthor = data.get('author')
    newPrice = data.get('price')
    newYear = data.get('releaseYear')
    newCopiesSold = data.get('copiesSold')

    book = Book.query.get(id)
    
    if book:
        if newName and newPrice:
            book.name = newName
            book.genre_id = newGenre
            book.author_id = newAuthor
            book.price = newPrice
            book.release_year = newYear
            book.copies_sold = newCopiesSold

            try:
                db.session.commit()
                return jsonify({"message": "Book updated successfully!"}), 200
            except Exception as e:
                db.session.rollback()
                return jsonify({"error": str(e)}), 500
        else:
            return jsonify({"error": "Book name and price are Required!"}), 400
    else:
        return jsonify({"error": "Book not found!"}), 404
    
#START REPORT ENDPOINTS
@app.route("/generate_report", methods=['GET', 'POST'])
def generate_report():
    data = request.get_json()
    author = data.get('author')
    genre = data.get('genre')
    minPrice = data.get('minPrice')
    maxPrice = data.get('maxPrice')
    minReleaseYear = data.get('minReleaseYear')
    maxReleaseYear = data.get('maxReleaseYear')

    author = -1 if author in (None, '', -1) else int(author)
    genre = -1 if genre in (None, '', -1) else int(genre)

    books_result = None
    total_copies = 0
    total_revenue = 0
    if author != -1 and genre != -1:
        book_stmt1 = text("""
                    SELECT 
                    b.name AS name,
                    CONCAT(a.first_name, ' ', a.last_name) AS author,
                    g.genre_name AS genre,
                    b.release_year AS release_year,
                    b.price AS price,
                    b.copies_sold AS copies_sold,
                    (b.price * b.copies_sold) AS revenue
                    FROM book b
                    JOIN author a ON b.author_id = a.id
                    JOIN genre g ON b.genre_id = g.id
                    WHERE b.author_id = :author_id AND b.genre_id = :genre_id AND (b.price >= :minPrice AND b.price <= :maxPrice) AND (b.release_year >= :minReleaseYear AND b.release_year <= :maxReleaseYear)
                """)
        
        total_copies_stmt1 = text("""
                             SELECT SUM(b.copies_sold) AS totalCopies
                             FROM book b
                             JOIN author a ON b.author_id = a.id
                             JOIN genre g ON b.genre_id = g.id
                             WHERE b.author_id = :author_id AND b.genre_id = :genre_id AND (b.price >= :minPrice AND b.price <= :maxPrice) AND (b.release_year >= :minReleaseYear AND b.release_year <= :maxReleaseYear)
                             """)
        
        total_revenues_stmt1 = text("""
                               SELECT SUM(b.copies_sold * b.price) AS totalRevenue
                               FROM book b
                               JOIN author a ON b.author_id = a.id
                               JOIN genre g ON b.genre_id = g.id
                               WHERE b.author_id = :author_id AND b.genre_id = :genre_id AND (b.price >= :minPrice AND b.price <= :maxPrice) AND (b.release_year >= :minReleaseYear AND b.release_year <= :maxReleaseYear)
                               """)

        try:
            with db.session.begin():
                books_result = db.session.execute(book_stmt1, {"author_id": author, "genre_id": genre, "minPrice": minPrice, "maxPrice": maxPrice, "minReleaseYear": minReleaseYear, "maxReleaseYear": maxReleaseYear}).mappings().all()
                total_copies = db.session.execute(total_copies_stmt1, {"author_id": author, "genre_id": genre, "minPrice": minPrice, "maxPrice": maxPrice, "minReleaseYear": minReleaseYear, "maxReleaseYear": maxReleaseYear}).fetchone()[0] or 0
                total_revenue = db.session.execute(total_revenues_stmt1, {"author_id": author, "genre_id": genre, "minPrice": minPrice, "maxPrice": maxPrice, "minReleaseYear": minReleaseYear, "maxReleaseYear": maxReleaseYear}).fetchone()[0] or 0
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    elif author == -1 and genre != -1:
        book_stmt2 = text("""
                    SELECT 
                    b.name AS name,
                    CONCAT(a.first_name, ' ', a.last_name) AS author,
                    g.genre_name AS genre,
                    b.release_year AS release_year,
                    b.price AS price,
                    b.copies_sold AS copies_sold,
                    (b.price * b.copies_sold) AS revenue
                    FROM book b
                    JOIN author a ON b.author_id = a.id
                    JOIN genre g ON b.genre_id = g.id
                    WHERE b.genre_id = :genre_id AND (b.price >= :minPrice AND b.price <= :maxPrice) AND (b.release_year >= :minReleaseYear AND b.release_year <= :maxReleaseYear)
                """)
        
        total_copies_stmt2 = text("""
                             SELECT SUM(b.copies_sold) AS totalCopies
                             FROM book b
                             JOIN author a ON b.author_id = a.id
                             JOIN genre g ON b.genre_id = g.id
                             WHERE b.genre_id = :genre_id AND (b.price >= :minPrice AND b.price <= :maxPrice) AND (b.release_year >= :minReleaseYear AND b.release_year <= :maxReleaseYear)
                             """)
        
        total_revenues_stmt2 = text("""
                               SELECT SUM(b.copies_sold * b.price) AS totalRevenue
                               FROM book b
                               JOIN author a ON b.author_id = a.id
                               JOIN genre g ON b.genre_id = g.id
                               WHERE b.genre_id = :genre_id AND (b.price >= :minPrice AND b.price <= :maxPrice) AND (b.release_year >= :minReleaseYear AND b.release_year <= :maxReleaseYear)
                               """)

        try:
            with db.session.begin():
                books_result = db.session.execute(book_stmt2, {"genre_id": genre, "minPrice": minPrice, "maxPrice": maxPrice, "minReleaseYear": minReleaseYear, "maxReleaseYear": maxReleaseYear}).mappings().all()
                total_copies = db.session.execute(total_copies_stmt2, {"genre_id": genre, "minPrice": minPrice, "maxPrice": maxPrice, "minReleaseYear": minReleaseYear, "maxReleaseYear": maxReleaseYear}).fetchone()[0] or 0
                total_revenue = db.session.execute(total_revenues_stmt2, {"genre_id": genre, "minPrice": minPrice, "maxPrice": maxPrice, "minReleaseYear": minReleaseYear, "maxReleaseYear": maxReleaseYear}).fetchone()[0] or 0
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    elif author != -1 and genre == -1:
        book_stmt3 = text("""
                    SELECT 
                    b.name AS name,
                    CONCAT(a.first_name, ' ', a.last_name) AS author,
                    g.genre_name AS genre,
                    b.release_year AS release_year,
                    b.price AS price,
                    b.copies_sold AS copies_sold,
                    (b.price * b.copies_sold) AS revenue
                    FROM book b
                    JOIN author a ON b.author_id = a.id
                    JOIN genre g ON b.genre_id = g.id
                    WHERE b.author_id = :author_id AND (b.price >= :minPrice AND b.price <= :maxPrice) AND (b.release_year >= :minReleaseYear AND b.release_year <= :maxReleaseYear)
                """)
        
        total_copies_stmt3 = text("""
                             SELECT SUM(b.copies_sold) AS totalCopies
                             FROM book b
                             JOIN author a ON b.author_id = a.id
                             JOIN genre g ON b.genre_id = g.id
                             WHERE b.author_id = :author_id AND (b.price >= :minPrice AND b.price <= :maxPrice) AND (b.release_year >= :minReleaseYear AND b.release_year <= :maxReleaseYear)
                             """)
        
        total_revenues_stmt3 = text("""
                               SELECT SUM(b.copies_sold * b.price) AS totalRevenue
                               FROM book b
                               JOIN author a ON b.author_id = a.id
                               JOIN genre g ON b.genre_id = g.id
                               WHERE b.author_id = :author_id AND (b.price >= :minPrice AND b.price <= :maxPrice) AND (b.release_year >= :minReleaseYear AND b.release_year <= :maxReleaseYear)
                               """)

        try:
            with db.session.begin():
                books_result = db.session.execute(book_stmt3, {"author_id": author, "minPrice": minPrice, "maxPrice": maxPrice, "minReleaseYear": minReleaseYear, "maxReleaseYear": maxReleaseYear}).mappings().all()
                total_copies = db.session.execute(total_copies_stmt3, {"author_id": author, "minPrice": minPrice, "maxPrice": maxPrice, "minReleaseYear": minReleaseYear, "maxReleaseYear": maxReleaseYear}).fetchone()[0] or 0
                total_revenue = db.session.execute(total_revenues_stmt3, {"author_id": author, "minPrice": minPrice, "maxPrice": maxPrice, "minReleaseYear": minReleaseYear, "maxReleaseYear": maxReleaseYear}).fetchone()[0] or 0
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    elif author == -1 and genre == -1:
        book_stmt4 = text("""
                    SELECT 
                    b.name AS name,
                    CONCAT(a.first_name, ' ', a.last_name) AS author,
                    g.genre_name AS genre,
                    b.release_year AS release_year,
                    b.price AS price,
                    b.copies_sold AS copies_sold,
                    (b.price * b.copies_sold) AS revenue
                    FROM book b
                    JOIN author a ON b.author_id = a.id
                    JOIN genre g ON b.genre_id = g.id
                    WHERE (b.price >= :minPrice AND b.price <= :maxPrice) AND (b.release_year >= :minReleaseYear AND b.release_year <= :maxReleaseYear)
                """)
        
        total_copies_stmt4 = text("""
                             SELECT SUM(b.copies_sold) AS totalCopies
                             FROM book b
                             JOIN author a ON b.author_id = a.id
                             JOIN genre g ON b.genre_id = g.id
                             WHERE (b.price >= :minPrice AND b.price <= :maxPrice) AND (b.release_year >= :minReleaseYear AND b.release_year <= :maxReleaseYear)
                             """)
        
        total_revenues_stmt4 = text("""
                               SELECT SUM(b.copies_sold * b.price) AS totalRevenue
                               FROM book b
                               JOIN author a ON b.author_id = a.id
                               JOIN genre g ON b.genre_id = g.id
                               WHERE (b.price >= :minPrice AND b.price <= :maxPrice) AND (b.release_year >= :minReleaseYear AND b.release_year <= :maxReleaseYear)
                               """)

        try:
            with db.session.begin():
                books_result = db.session.execute(book_stmt4, {"minPrice": minPrice, "maxPrice": maxPrice, "minReleaseYear": minReleaseYear, "maxReleaseYear": maxReleaseYear}).mappings().all()
                total_copies = db.session.execute(total_copies_stmt4, {"minPrice": minPrice, "maxPrice": maxPrice, "minReleaseYear": minReleaseYear, "maxReleaseYear": maxReleaseYear}).fetchone()[0] or 0
                total_revenue = db.session.execute(total_revenues_stmt4, {"minPrice": minPrice, "maxPrice": maxPrice, "minReleaseYear": minReleaseYear, "maxReleaseYear": maxReleaseYear}).fetchone()[0] or 0
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    books = [{"name": book['name'], "author": book['author'], "genre": book['genre'], "releaseYear": book['release_year'], "price": book['price'], "copies": book['copies_sold'], "revenue": book['revenue']} for book in books_result]
    return jsonify({"books": books, "totalCopiesSold": total_copies or 0, "totalRevenue": total_revenue or 0})




    



    

if __name__ == "__main__":
    app.run(debug=True, port=5000)