from deepface import DeepFace
import cv2
import os

# Function to detect a face in an image
def detect_face(image_path):
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(faces) == 0:
        raise Exception("No face detected in the image.")
    elif len(faces) > 1:
        raise Exception("Multiple faces detected. Please use an image with only one face.")

    x, y, w, h = faces[0]
    cropped_face = image[y:y+h, x:x+w]
    cropped_path = os.path.splitext(image_path)[0] + "_cropped.jpg"
    cv2.imwrite(cropped_path, cropped_face)
    return cropped_path

# Function to verify two faces
def verify_faces(visitor_photo_path, id_photo_path):
    try:
        # Perform face verification
        result = DeepFace.verify(visitor_photo_path, id_photo_path, model_name='VGG-Face')

        if result['verified']:
            return f"Faces match with a confidence of {100 - result['distance'] * 100:.2f}%"
        else:
            return "Faces do not match."
    except Exception as e:
        return f"Error: {e}"

# Main function to process the images
def main():
    visitor_photo_path = "visitor.jpg"  # Replace with the actual path to the visitor's photo
    id_photo_path = "id.jpg"  # Replace with the actual path to the ID photo

    try:
        # Detect and crop faces
        visitor_cropped = detect_face(visitor_photo_path)
        id_cropped = detect_face(id_photo_path)

        # Verify the faces
        result = verify_faces(visitor_cropped, id_cropped)
        print(result)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()