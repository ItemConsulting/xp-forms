package no.item.forms.mapper;

import com.enonic.xp.script.serializer.MapGenerator;

import java.util.Collection;
import java.util.Map;

public final class MapperHelper
{
    public static void serializeMultimap( final String name, final MapGenerator gen,
                                          final Map<String, ? extends Collection<String>> params )
    {
        gen.map( name );
        params.forEach( ( key, values ) -> {
            if ( values.size() == 1 )
            {
                gen.value( key, values.iterator().next() );
            }
            else
            {
                gen.array( key );
                values.forEach( gen::value );
                gen.end();
            }
        } );
        gen.end();
    }
}
