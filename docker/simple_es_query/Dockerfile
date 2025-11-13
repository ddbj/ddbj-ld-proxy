FROM python:3.10.16
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
ENV PORT=5001
EXPOSE 5001
CMD ["python", "app.py"]
