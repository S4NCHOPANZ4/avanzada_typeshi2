package actividad3;

public class LibroTextoUD extends LibroTexto {
    private String facultad;

    public LibroTextoUD(String titulo, String autor, double precio, String curso, String facultad) {
        super(titulo, autor, precio, curso);
        this.facultad = facultad;
    }

    public String getFacultad() { return facultad; }
    public void setFacultad(String facultad) { this.facultad = facultad; }

    @Override
    public String mostrarInfo() {
        return super.mostrarInfo() + "\nFacultad: " + facultad;
    }
        @Override
    public String toString() {
        return titulo;
    }
}
