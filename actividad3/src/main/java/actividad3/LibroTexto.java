
package actividad3;

public class LibroTexto extends Libro {
    private String curso;

    public LibroTexto(String titulo, String autor, double precio, String curso) {
        super(titulo, autor, precio);
        this.curso = curso;
    }

    public String getCurso() { return curso; }
    public void setCurso(String curso) { this.curso = curso; }
    @Override
    public String mostrarInfo() {
        return super.mostrarInfo() + "\nCurso: " + curso;
    }
    @Override
    public String toString() {
        return titulo;
    }
}
