import json

if __name__ == '__main__':

    with open('places.json', 'r') as p:

        places = json.load(p)
        print(type(places))

        Dict = {}

        for place in places:
            place = dict(place)

            Dict[place['id']] = place
        
        print(Dict)
