package actividad3;

public class Libro {
    String titulo;
    private String autor;
    private double precio;

    // Constructor
    public Libro(String titulo, String autor, double precio) {
        this.titulo = titulo;
        this.autor = autor;
        this.precio = precio;
    }

    // Getters - setters
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }

    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }

    public String mostrarInfo() {
        return "Título: " + titulo + 
               "\nAutor: " + autor + 
               "\nPrecio: " + precio;
    }
    @Override
    public String toString() {
        return titulo;
    }
}

