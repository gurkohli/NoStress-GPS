Prereq:

Install Docker CE
https://docs.docker.com/engine/installation/

docker pull klokantech/tileserver-gl

Use:

cd server/
sudo docker run -it -v $(pwd):/data -p 8080:80 klokantech/tileserver-gl

cd server/
python -m SimpleHTTPServer 8000

In browser go to localhost:8000
