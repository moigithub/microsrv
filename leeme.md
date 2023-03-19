docker login
docker build -t <tag-name> .
docker push <tag-name>


kubectl get pods
kubectl get services
kubectl get namespace
kubectl apply -f <yaml-file>
kubectl delete pods <some-id>
kubectl port-forward <pod_name> 8080:8080
kubectl rollout restart deployment auth-depl
kubectl config view
kubectl config use-context
kubectl create secret generic somename --from-literal=MY_KEY=asdfaf

skaffold dev


----
install ingress(controller) copy/paste command from ingress page