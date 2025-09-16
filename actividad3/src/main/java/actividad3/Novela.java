
package actividad3;

public class Novela extends Libro {
    private String tipo; 

    public Novela(String titulo, String autor, double precio, String tipo) {
        super(titulo, autor, precio);
        this.tipo = tipo;
    }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    @Override
    public String mostrarInfo() {
        return super.mostrarInfo() + "\nTipo: " + tipo;
    }
    @Override
    public String toString() {
    return titulo; // solo muestra el título en la lista
}
}

